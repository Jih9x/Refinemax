// Global variables
let currentRefineLevel = 0;
let totalAttempts = 0;
let successCount = 0;
let failCount = 0;
let breakCount = 0;
let isItemBroken = false; // เพิ่มตัวแปรเพื่อติดตามสถานะว่าไอเทมแตกหรือไม่
let inventory = []; // เก็บไอเทมในคลังจำลอง
let currentItemId = null; // ID ของไอเทมปัจจุบัน
let totalZeny = 0; // Zeny ที่ใช้ไปทั้งหมด
let totalStones = 0; // หินตีบวกที่ใช้ไปทั้งหมด

// ตารางอัตราความสำเร็จและค่าใช้จ่าย
const refineRates = [
    { level: 1, success: 100, cost: 10000 },
    { level: 2, success: 100, cost: 20000 },
    { level: 3, success: 100, cost: 30000 },
    { level: 4, success: 50, cost: 60000 },
    { level: 5, success: 50, cost: 70000 },
    { level: 6, success: 40, cost: 80000 },
    { level: 7, success: 40, cost: 90000 },
    { level: 8, success: 40, cost: 100000 },
    { level: 9, success: 40, cost: 100000 },
    { level: 10, success: 40, cost: 100000 },
    { level: 11, success: 40, cost: 100000 },
    { level: 12, success: 40, cost: 100000 },
    { level: 13, success: 40, cost: 100000 },
    { level: 14, success: 40, cost: 100000 }
];

// DOM Elements
const itemTypeSelect = document.getElementById('itemType');
const currentRefineLevelElement = document.getElementById('currentRefineLevel');
const successRateElement = document.getElementById('successRate');
const breakRateElement = document.getElementById('breakRate');
const refineCostElement = document.getElementById('refineCost');
const stoneUseElement = document.getElementById('stoneUse');
const totalZenyElement = document.getElementById('totalZeny');
const totalStonesElement = document.getElementById('totalStones');
const statBonusElement = document.getElementById('statBonus');
const refineLogElement = document.getElementById('refineLog');
const totalAttemptsElement = document.getElementById('totalAttempts');
const successCountElement = document.getElementById('successCount');
const failCountElement = document.getElementById('failCount');
const breakCountElement = document.getElementById('breakCount');
const totalZenySpentElement = document.getElementById('totalZenySpent');
const totalStonesUsedElement = document.getElementById('totalStonesUsed');
const refineBtn = document.getElementById('refineBtn');
const resetBtn = document.getElementById('resetBtn');
const resetAllBtn = document.getElementById('resetAllBtn');
const itemSymbol = document.getElementById('itemSymbol');
const inventoryContainer = document.getElementById('inventory');
const addToInventoryBtn = document.getElementById('addToInventoryBtn');

// Event Listeners
document.addEventListener('DOMContentLoaded', initialize);
itemTypeSelect.addEventListener('change', updateItemImage);
itemTypeSelect.addEventListener('change', updateRates);
refineBtn.addEventListener('click', refineItem);
resetBtn.addEventListener('click', resetCurrentItem);
resetAllBtn.addEventListener('click', resetAll);
addToInventoryBtn.addEventListener('click', addItemToInventory);

// Initialize the simulator
function initialize() {
    updateItemImage();
    updateRates();
    updateStatBonus();
    updateStats();
    loadInventory(); // โหลดข้อมูลคลังจำลองจาก localStorage ถ้ามี
}

// โหลดข้อมูลคลังจำลองจาก localStorage
function loadInventory() {
    const savedInventory = localStorage.getItem('romInventory');
    if (savedInventory) {
        inventory = JSON.parse(savedInventory);
        renderInventory();
    }
}

// บันทึกข้อมูลคลังจำลองลง localStorage
function saveInventory() {
    localStorage.setItem('romInventory', JSON.stringify(inventory));
}

// เพิ่มไอเทมลงในคลังจำลอง
function addItemToInventory() {
    const itemType = itemTypeSelect.value;
    const itemIndex = itemTypeSelect.selectedIndex;
    const itemText = itemTypeSelect.options[itemIndex].text;
    
    // สร้าง ID ที่ไม่ซ้ำกันสำหรับไอเทม
    const itemId = 'item_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    
    // เพิ่มไอเทมใหม่ลงในคลัง
    const newItem = {
        id: itemId,
        type: itemType,
        name: itemText,
        level: 0,
        isBroken: false
    };
    
    inventory.push(newItem);
    saveInventory();
    renderInventory();
    
    // เลือกไอเทมที่เพิ่งเพิ่ม
    selectItemFromInventory(itemId);
}

// แสดงรายการไอเทมในคลังจำลอง
function renderInventory() {
    inventoryContainer.innerHTML = '';
    
    if (inventory.length === 0) {
        const emptyText = document.createElement('p');
        emptyText.textContent = 'คลังว่างเปล่า เพิ่มไอเทมโดยเลือกประเภทไอเทมและกดปุ่ม "เพิ่มไอเทมลงคลัง"';
        emptyText.style.gridColumn = '1 / -1';
        emptyText.style.color = '#c9d1ff';
        emptyText.style.textAlign = 'center';
        emptyText.style.padding = '10px';
        inventoryContainer.appendChild(emptyText);
        return;
    }
    
    // สร้างรายการไอเทมในคลัง
    inventory.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        if (item.isBroken) {
            itemElement.classList.add('broken');
        }
        if (item.id === currentItemId) {
            itemElement.classList.add('selected');
        }
        
        // สร้างสัญลักษณ์แทนรูปภาพ
        const itemImageDiv = document.createElement('div');
        itemImageDiv.className = 'item-image';
        
        // กำหนดสัญลักษณ์ตามประเภทไอเทม
        let symbol = '?';
        switch (item.type) {
            case 'weapon': symbol = '⚔️'; break;
            case 'shield': symbol = '🛡️'; break;
            case 'armor': symbol = '👕'; break;
            case 'garment': symbol = '🧥'; break;
            case 'shoes': symbol = '👟'; break;
            case 'accessory': symbol = '💍'; break;
            case 'hat': symbol = '🎩'; break;
            case 'face': symbol = '👓'; break;
            case 'mouth': symbol = '😷'; break;
            case 'back': symbol = '🎒'; break;
            case 'tail': symbol = '🦊'; break;
        }
        itemImageDiv.textContent = symbol;
        
        // สร้างข้อมูลระดับตีบวก
        const itemLevel = document.createElement('div');
        itemLevel.className = 'item-level';
        if (item.isBroken) {
            itemLevel.classList.add('broken');
        }
        itemLevel.textContent = `+${item.level}`;
        
        // ชื่อไอเทม
        const itemName = document.createElement('div');
        itemName.className = 'item-name';
        itemName.textContent = item.name;
        
        // เพิ่มข้อมูลว่าแตกที่ระดับเท่าไหร่ (สำหรับไอเทมที่แตก)
        if (item.isBroken && item.brokenAtLevel) {
            const brokenInfo = document.createElement('div');
            brokenInfo.className = 'broken-info';
            brokenInfo.textContent = `แตกที่ +${item.brokenAtLevel}`;
            itemElement.appendChild(brokenInfo);
        }
        
        // ส่วนการกระทำกับไอเทม (ปุ่มลบ)
        const itemActions = document.createElement('div');
        itemActions.className = 'item-actions';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-item-btn';
        deleteBtn.textContent = 'ลบ';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // ป้องกันการเลือกไอเทม
            deleteItemFromInventory(item.id);
        });
        
        itemActions.appendChild(deleteBtn);
        
        // ประกอบส่วนต่างๆ เข้าด้วยกัน
        itemElement.appendChild(itemImageDiv);
        itemElement.appendChild(itemLevel);
        itemElement.appendChild(itemName);
        itemElement.appendChild(itemActions);
        
        // เพิ่มเครื่องหมาย X บนไอเทมที่แตก
        if (item.isBroken) {
            const brokenMark = document.createElement('div');
            brokenMark.className = 'broken-mark';
            brokenMark.textContent = '✗';
            itemElement.appendChild(brokenMark);
        }
        
        // เพิ่ม event listener สำหรับการคลิกเลือกไอเทม
        itemElement.addEventListener('click', () => {
            if (!item.isBroken) {
                selectItemFromInventory(item.id);
            } else {
                alert('ไอเทมนี้แตกแล้ว ไม่สามารถเลือกได้');
            }
        });
        
        inventoryContainer.appendChild(itemElement);
    });
}

// เลือกไอเทมจากคลังจำลอง
function selectItemFromInventory(itemId) {
    // รีเซ็ตไอเทมปัจจุบันก่อน
    resetCurrentItemState();
    
    // หาไอเทมที่เลือกจากคลัง
    const selectedItem = inventory.find(item => item.id === itemId);
    if (selectedItem && !selectedItem.isBroken) {
        currentItemId = itemId;
        
        // อัพเดทข้อมูลไอเทมปัจจุบัน
        itemTypeSelect.value = selectedItem.type;
        currentRefineLevel = selectedItem.level;
        isItemBroken = selectedItem.isBroken;
        
        // อัพเดท UI
        updateItemImage();
        updateRefineLevelDisplay();
        updateStatBonus();
        updateRates();
        renderInventory(); // อัพเดทการแสดงไอเทมที่เลือกในคลัง
        
        addToLog(`เลือกไอเทม ${selectedItem.name} +${selectedItem.level}`, 'reset');
    }
}

// อัพเดทข้อมูลไอเทมในคลังจำลอง
function updateInventoryItem() {
    if (currentItemId) {
        const itemIndex = inventory.findIndex(item => item.id === currentItemId);
        if (itemIndex !== -1) {
            inventory[itemIndex].level = currentRefineLevel;
            inventory[itemIndex].isBroken = isItemBroken;
            saveInventory();
            renderInventory();
        }
    }
}

// Update item symbol based on selection
function updateItemImage() {
    const itemType = itemTypeSelect.value;
    
    // กำหนดสัญลักษณ์ตามประเภทไอเทม
    let symbol = '?';
    switch (itemType) {
        case 'weapon': symbol = '⚔️'; break;
        case 'shield': symbol = '🛡️'; break;
        case 'armor': symbol = '👕'; break;
        case 'garment': symbol = '🧥'; break;
        case 'shoes': symbol = '👟'; break;
        case 'accessory': symbol = '💍'; break;
        case 'hat': symbol = '🎩'; break;
        case 'face': symbol = '👓'; break;
        case 'mouth': symbol = '😷'; break;
        case 'back': symbol = '🎒'; break;
        case 'tail': symbol = '🦊'; break;
    }
    
    itemSymbol.textContent = symbol;
}

// Calculate and update success and break rates
function updateRates() {
    const rates = calculateRates();
    successRateElement.textContent = rates.successRate;
    breakRateElement.textContent = rates.breakRate;
}

// Calculate success and break rates based on current state
function calculateRates() {
    let successRate = 100;
    let breakRate = 0;
    let failRate = 0;
    let cost = 0;
    
    // ไม่สามารถตีบวกได้ถ้าเป็น +15 แล้ว
    if (currentRefineLevel >= 15) {
        return {
            successRate: 0,
            breakRate: 0,
            failRate: 0,
            cost: 0
        };
    }
    
    // ดึงข้อมูลจากตาราง
    const rateInfo = refineRates.find(rate => rate.level === currentRefineLevel);
    if (rateInfo) {
        successRate = rateInfo.success;
        cost = rateInfo.cost;
        
        // คำนวณโอกาสล้มเหลวและแตก
        if (successRate < 100) {
            const totalFailRate = 100 - successRate;
            failRate = totalFailRate / 2; // 50% ของความล้มเหลวทั้งหมด
            breakRate = totalFailRate / 2; // 50% ของความล้มเหลวทั้งหมด
        } else {
            failRate = 0;
            breakRate = 0;
        }
    }
    
    // อัพเดทค่าใช้จ่ายในหน้าจอ
    refineCostElement.textContent = cost.toLocaleString();
    
    return {
        successRate: Math.round(successRate),
        breakRate: Math.round(breakRate),
        failRate: Math.round(failRate),
        cost: cost
    };
}

// Calculate stat bonus based on refine level
function calculateStatBonus() {
    // Each refine level adds 15 ATK/DEF
    return currentRefineLevel * 15;
}

// Update stat bonus display
function updateStatBonus() {
    const bonus = calculateStatBonus();
    statBonusElement.textContent = bonus;
}

// Main refining function
function refineItem() {
    // ต้องเลือกไอเทมก่อน
    if (!currentItemId) {
        alert("กรุณาเลือกไอเทมจากคลังจำลองก่อนตีบวก");
        return;
    }

    // ถ้าไอเทมแตกแล้ว ไม่สามารถตีบวกต่อได้
    if (isItemBroken) {
        alert("ไอเทมแตกแล้ว ไม่สามารถตีบวกต่อได้! เลือกไอเทมอื่นหรือกด Reset");
        return;
    }

    // Cannot enhance above +15
    if (currentRefineLevel >= 15) {
        addToLog(`ไอเทมเป็น +${currentRefineLevel} แล้ว ไม่สามารถตีบวกต่อได้`, 'fail');
        return;
    }
    
    // Calculate rates
    const rates = calculateRates();
    const successRate = rates.successRate;
    const failRate = rates.failRate;
    const breakRate = rates.breakRate;
    const cost = rates.cost;
    
    // เพิ่มค่าใช้จ่ายและหินตีบวกที่ใช้
    totalZeny += cost;
    totalStones += 1;  // ทุกครั้งที่ตีบวกใช้หินตีบวก 1 ชิ้น
    
    // อัพเดทหน้าจอ
    totalZenyElement.textContent = totalZeny.toLocaleString();
    totalStonesElement.textContent = totalStones;
    totalZenySpentElement.textContent = totalZeny.toLocaleString();
    totalStonesUsedElement.textContent = totalStones;
    
    // Update statistics
    totalAttempts++;
    
    // Generate random number (1-100)
    const roll = Math.floor(Math.random() * 100) + 1;
    
    // ดึงข้อมูลไอเทมปัจจุบัน
    const currentItem = inventory.find(item => item.id === currentItemId);
    const itemName = currentItem ? currentItem.name : 'ไอเทม';
    
    // Determine result
    if (roll <= successRate) {
        // Success: +1
        currentRefineLevel++;
        successCount++;
        addToLog(`การตีบวก ${itemName} +${currentRefineLevel - 1} เป็น +${currentRefineLevel} สำเร็จ! (โยนได้ ${roll}, ต้องการ ≤ ${successRate}) ใช้ไป ${cost.toLocaleString()} Zeny`, 'success');
    } else if (roll <= (successRate + failRate)) {
        // Fail normally: -1 (minimum level is 0)
        failCount++;
        const oldLevel = currentRefineLevel;
        currentRefineLevel = Math.max(0, currentRefineLevel - 1);
        
        addToLog(`การตีบวก ${itemName} +${oldLevel} ล้มเหลว! ระดับลดเหลือ +${currentRefineLevel} (โยนได้ ${roll}, ต้องการ ≤ ${successRate}) ใช้ไป ${cost.toLocaleString()} Zeny`, 'fail');
    } else {
        // Break: -1 and item destroyed, cannot refine anymore
        breakCount++;
        isItemBroken = true;
        const oldLevel = currentRefineLevel;
        
        // เก็บข้อมูลว่าแตกที่ระดับเท่าไหร่
        if (currentItemId) {
            const itemIndex = inventory.findIndex(item => item.id === currentItemId);
            if (itemIndex !== -1) {
                inventory[itemIndex].brokenAtLevel = oldLevel;
            }
        }
        
        currentRefineLevel = Math.max(0, currentRefineLevel - 1);
        
        addToLog(`ไอเทม ${itemName} +${oldLevel} ล้มเหลวและแตก! ระดับลดเหลือ +${currentRefineLevel} (โยนได้ ${roll}, ต้องการ ≤ ${successRate}) ใช้ไป ${cost.toLocaleString()} Zeny`, 'break');
        
        // เพิ่มเอฟเฟกต์ภาพให้ชัดเจนว่าไอเทมแตกแล้ว
        itemSymbol.style.opacity = "0.5";
        itemSymbol.style.filter = "grayscale(100%)";
        
        // เปลี่ยนสีของระดับตีบวกให้เป็นสีแดง
        document.querySelector('.refine-level').classList.add('broken');
        
        // เพิ่มไอคอนแสดงว่าไอเทมแตก
        const brokenIcon = document.createElement('div');
        brokenIcon.className = 'broken-icon';
        brokenIcon.textContent = '✗';
        document.querySelector('.current-item').appendChild(brokenIcon);
        
        // แสดงข้อความแจ้งเตือนที่ชัดเจนยิ่งขึ้น
        alert(`ไอเทม ${itemName} แตกแล้ว! กรุณาเลือกไอเทมอื่นจากคลังจำลอง`);
        addToLog(`ไม่สามารถตีบวก ${itemName} ต่อได้ เนื่องจากไอเทมแตก กรุณาเลือกไอเทมใหม่`, 'break');
    }
    
    // อัพเดทข้อมูลไอเทมในคลัง
    updateInventoryItem();
    
    // Update UI
    updateRefineLevelDisplay();
    updateStatBonus();
    updateRates();
    updateStats();
}

// Add new entry to refine log
function addToLog(message, type) {
    const logEntry = document.createElement('p');
    logEntry.textContent = message;
    logEntry.classList.add(`log-${type}`);
    refineLogElement.prepend(logEntry);
    
    // Limit log size
    if (refineLogElement.children.length > 10) {
        refineLogElement.removeChild(refineLogElement.lastChild);
    }
}

// Update statistics display
function updateStats() {
    totalAttemptsElement.textContent = totalAttempts;
    successCountElement.textContent = successCount;
    failCountElement.textContent = failCount;
    breakCountElement.textContent = breakCount;
}

// Update refine level display
function updateRefineLevelDisplay() {
    currentRefineLevelElement.textContent = currentRefineLevel;
}

// Reset refine level to 0 (after break)
function resetRefineLevel() {
    currentRefineLevel = 0;
    updateRefineLevelDisplay();
    updateStatBonus();
    updateRates();
}

// รีเซ็ตสถานะของไอเทมปัจจุบัน (แต่ไม่รีเซ็ตสถิติทั้งหมด)
function resetCurrentItemState() {
    isItemBroken = false;
    
    // คืนค่าภาพกลับสู่ปกติ
    itemSymbol.style.opacity = "1";
    itemSymbol.style.filter = "none";
    
    // ลบคลาส broken ออกจากระดับตีบวก
    const refineLevelElement = document.querySelector('.refine-level');
    if (refineLevelElement) {
        refineLevelElement.classList.remove('broken');
    }
    
    // ลบไอคอนกากบาท
    const brokenIcon = document.querySelector('.broken-icon');
    if (brokenIcon) {
        brokenIcon.remove();
    }
}

// Reset current item (แต่ไม่รีเซ็ตสถิติทั้งหมด)
function resetCurrentItem() {
    // รีเซ็ตสถานะไอเทมปัจจุบัน
    currentRefineLevel = 0;
    resetCurrentItemState();
    
    // อัพเดทข้อมูลไอเทมในคลัง
    updateInventoryItem();
    
    // Update UI
    updateRefineLevelDisplay();
    updateStatBonus();
    updateRates();
    
    addToLog('รีเซ็ตไอเทมปัจจุบัน', 'reset');
}

// ลบไอเทมจากคลังจำลอง
function deleteItemFromInventory(itemId) {
    if (confirm('คุณต้องการลบไอเทมนี้ออกจากคลังจำลองหรือไม่?')) {
        // ถ้าเป็นไอเทมที่กำลังใช้งานอยู่
        if (itemId === currentItemId) {
            currentItemId = null;
            resetCurrentItemState();
            currentRefineLevel = 0;
            updateRefineLevelDisplay();
            updateStatBonus();
            updateRates();
        }
        
        // ลบไอเทมออกจากคลัง
        inventory = inventory.filter(item => item.id !== itemId);
        saveInventory();
        renderInventory();
        
        addToLog('ลบไอเทมออกจากคลัง', 'reset');
    }
}

// Reset all statistics และล้างคลังไอเทมทั้งหมด
function resetAll() {
    if (confirm('คุณต้องการล้างข้อมูลทั้งหมด รวมถึงคลังไอเทมหรือไม่?')) {
        currentRefineLevel = 0;
        totalAttempts = 0;
        successCount = 0;
        failCount = 0;
        breakCount = 0;
        totalZeny = 0;
        totalStones = 0;
        isItemBroken = false;
        currentItemId = null;
        inventory = [];
        
        // ล้างข้อมูลใน localStorage
        localStorage.removeItem('romInventory');
        
        // รีเซ็ตสถานะไอเทม
        resetCurrentItemState();
        
        // Clear refine log
        refineLogElement.innerHTML = '';
        
        // Update UI
        updateRefineLevelDisplay();
        updateStatBonus();
        updateRates();
        updateStats();
        renderInventory();
        
        // อัพเดทค่าใช้จ่ายทั้งหมด
        totalZenyElement.textContent = '0';
        totalStonesElement.textContent = '0';
        totalZenySpentElement.textContent = '0';
        totalStonesUsedElement.textContent = '0';
        
        addToLog('รีเซ็ตระบบทั้งหมด', 'reset');
    }
}