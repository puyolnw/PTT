// Utility function: แปลงตัวเลขเป็นคำอ่านภาษาไทย
// ใช้สำหรับใบเสร็จรับเงิน/ใบกำกับภาษี
/* eslint-disable security/detect-object-injection */

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

  const units = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  const tens = ["", "สิบ", "ยี่สิบ", "สามสิบ", "สี่สิบ", "ห้าสิบ", "หกสิบ", "เจ็ดสิบ", "แปดสิบ", "เก้าสิบ"];
  const hundreds = ["", "หนึ่งร้อย", "สองร้อย", "สามร้อย", "สี่ร้อย", "ห้าร้อย", "หกร้อย", "เจ็ดร้อย", "แปดร้อย", "เก้าร้อย"];

  if (num < 10) {
    return units[num];
  } else if (num < 100) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    let result = tens[ten];
    if (unit === 1 && ten === 1) {
      result += "เอ็ด";
    } else if (unit > 0) {
      result += units[unit];
    }
    return result;
  } else if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    let result = hundreds[hundred];
    if (remainder > 0) {
      if (remainder < 10) {
        result += units[remainder];
      } else {
        const ten = Math.floor(remainder / 10);
        const unit = remainder % 10;
        result += tens[ten];
        if (unit === 1 && ten === 1) {
          result += "เอ็ด";
        } else if (unit > 0) {
          result += units[unit];
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
