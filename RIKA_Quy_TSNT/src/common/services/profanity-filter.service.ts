import { Injectable } from '@nestjs/common';

/**
 * Profanity Filter Service
 * Lọc ngôn từ độc hại trong nội dung
 */
@Injectable()
export class ProfanityFilterService {
  // Danh sách từ ngữ cấm (có thể mở rộng từ database)
  private badWords: string[] = [
    'địt', 'đụ', 'đéo', 'đĩ', 'đồ ngu', 'ngu si', 'đồ chó', 'chó má',
    'mẹ mày', 'bố mày', 'đồ khốn', 'khốn nạn', 'đồ súc vật',
    // Thêm các từ khác...
  ];

  /**
   * Kiểm tra và lọc ngôn từ độc hại
   * @param text - Văn bản cần kiểm tra
   * @returns Object chứa kết quả kiểm tra và văn bản đã lọc
   */
  filter(text: string): {
    hasProfanity: boolean;
    filteredText: string;
    detectedWords: string[];
  } {
    if (!text) {
      return { hasProfanity: false, filteredText: text, detectedWords: [] };
    }

    const detectedWords: string[] = [];
    let filteredText = text;

    // Kiểm tra từng từ cấm
    for (const word of this.badWords) {
      const regex = new RegExp(word, 'gi');
      if (regex.test(filteredText)) {
        detectedWords.push(word);
        // Thay thế bằng dấu *
        filteredText = filteredText.replace(regex, '*'.repeat(word.length));
      }
    }

    return {
      hasProfanity: detectedWords.length > 0,
      filteredText,
      detectedWords,
    };
  }

  /**
   * Chỉ kiểm tra có ngôn từ độc hại không (không lọc)
   * @param text - Văn bản cần kiểm tra
   * @returns true nếu có ngôn từ độc hại
   */
  hasProfanity(text: string): boolean {
    if (!text) return false;

    for (const word of this.badWords) {
      if (new RegExp(word, 'gi').test(text)) {
        return true;
      }
    }

    return false;
  }
}

