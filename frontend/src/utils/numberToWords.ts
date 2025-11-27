/**
 * Chuyển đổi số tiền sang chữ tiếng Việt
 * @param amount - Số tiền cần chuyển đổi
 * @returns Chuỗi số tiền bằng chữ
 */
export function numberToWords(amount: number): string {
  if (amount === 0) return 'Không đồng';
  
  const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const tens = ['', '', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
  const hundreds = ['', 'một trăm', 'hai trăm', 'ba trăm', 'bốn trăm', 'năm trăm', 'sáu trăm', 'bảy trăm', 'tám trăm', 'chín trăm'];
  
  function convertThreeDigits(num: number): string {
    if (num === 0) return '';
    
    let result = '';
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    
    if (hundred > 0) {
      result += hundreds[hundred] + ' ';
    }
    
    if (remainder > 0) {
      if (remainder < 10) {
        result += ones[remainder];
      } else if (remainder < 20) {
        if (remainder === 10) result += 'mười';
        else if (remainder === 11) result += 'mười một';
        else result += 'mười ' + ones[remainder % 10];
      } else {
        const ten = Math.floor(remainder / 10);
        const one = remainder % 10;
        result += tens[ten];
        if (one > 0) {
          result += ' ' + ones[one];
        }
      }
    }
    
    return result.trim();
  }
  
  // Chuyển đổi số tiền (làm tròn đến hàng đơn vị)
  const roundedAmount = Math.floor(amount);
  
  if (roundedAmount === 0) return 'Không đồng';
  
  const parts: string[] = [];
  
  // Tỷ
  const billions = Math.floor(roundedAmount / 1000000000);
  if (billions > 0) {
    parts.push(convertThreeDigits(billions) + ' tỷ');
  }
  
  // Triệu
  const millions = Math.floor((roundedAmount % 1000000000) / 1000000);
  if (millions > 0) {
    parts.push(convertThreeDigits(millions) + ' triệu');
  }
  
  // Nghìn
  const thousands = Math.floor((roundedAmount % 1000000) / 1000);
  if (thousands > 0) {
    parts.push(convertThreeDigits(thousands) + ' nghìn');
  }
  
  // Đơn vị
  const units = roundedAmount % 1000;
  if (units > 0) {
    parts.push(convertThreeDigits(units));
  }
  
  // Nếu không có phần nào thì trả về "không"
  if (parts.length === 0) {
    return 'Không đồng';
  }
  
  // Viết hoa chữ cái đầu
  const result = parts.join(' ') + ' đồng';
  return result.charAt(0).toUpperCase() + result.slice(1);
}

