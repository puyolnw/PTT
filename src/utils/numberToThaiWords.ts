// Utility function: แปลงตัวเลขเป็นคำอ่านภาษาไทย
// ใช้สำหรับใบเสร็จรับเงิน/ใบกำกับภาษี


export function convertNumberToThaiWords(amount: number): string {
  const baht = Math.floor(amount);
  const satang = Math.round((amount - baht) * 100);

  const bahtWords = convertIntegerToThai(baht);
  const satangWords = satang > 0 ? convertIntegerToThai(satang) : "";

  let result = "";
  if (bahtWords) {
    result += bahtWords + "บาท";
  }
  if (satangWords) {
    result += satangWords + "สตางค์";
  } else if (bahtWords) {
    result += "ถ้วน";
  }

  return result || "ศูนย์บาทถ้วน";
}

function convertIntegerToThai(num: number): string {
  if (num === 0) return "";

  const unitsMap = new Map([
    [1, "หนึ่ง"], [2, "สอง"], [3, "สาม"], [4, "สี่"], [5, "ห้า"],
    [6, "หก"], [7, "เจ็ด"], [8, "แปด"], [9, "เก้า"]
  ]);

  const tensMap = new Map([
    [1, "สิบ"], [2, "ยี่สิบ"], [3, "สามสิบ"], [4, "สี่สิบ"], [5, "ห้าสิบ"],
    [6, "หกสิบ"], [7, "เจ็ดสิบ"], [8, "แปดสิบ"], [9, "เก้าสิบ"]
  ]);

  const hundredsMap = new Map([
    [1, "หนึ่งร้อย"], [2, "สองร้อย"], [3, "สามร้อย"], [4, "สี่ร้อย"], [5, "ห้าร้อย"],
    [6, "หกร้อย"], [7, "เจ็ดร้อย"], [8, "แปดร้อย"], [9, "เก้าร้อย"]
  ]);

  if (num < 10) {
    return unitsMap.get(num) || "";
  } else if (num < 100) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    let result = tensMap.get(ten) || "";
    if (unit === 1 && ten >= 1) { // Adjusted logic for 11, 21, etc.
      result += "เอ็ด";
    } else if (unit > 0) {
      result += unitsMap.get(unit) || "";
    }
    return result;
  } else if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    let result = hundredsMap.get(hundred) || "";
    if (remainder > 0) {
      if (remainder < 10) {
        result += unitsMap.get(remainder) || "";
      } else {
        const ten = Math.floor(remainder / 10);
        const unit = remainder % 10;
        result += tensMap.get(ten) || "";
        if (unit === 1 && ten >= 1) {
          result += "เอ็ด";
        } else if (unit > 0) {
          result += unitsMap.get(unit) || "";
        }
      }
    }
    return result;
  } else if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    let result = convertIntegerToThai(thousand) + "พัน";
    if (remainder > 0) {
      result += convertIntegerToThai(remainder);
    }
    return result;
  } else if (num < 1000000000) {
    const million = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    let result = convertIntegerToThai(million) + "ล้าน";
    if (remainder > 0) {
      result += convertIntegerToThai(remainder);
    }
    return result;
  } else {
    // สำหรับจำนวนที่มากกว่า 1 พันล้าน
    const billion = Math.floor(num / 1000000000);
    const remainder = num % 1000000000;
    let result = convertIntegerToThai(billion) + "พันล้าน";
    if (remainder > 0) {
      result += convertIntegerToThai(remainder);
    }
    return result;
  }
}
