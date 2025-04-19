// Content cleanup functions for test-full-process.js

/**
 * Cleans up the content by removing unwanted sections and formatting
 * @param {string} content - The content to clean up
 * @returns {string} - The cleaned content
 */
function cleanupContent(content) {
  if (!content) return '';

  let cleanedContent = content
    // Remove standard unwanted content
    .replace(/Posted:/g, '')
    .replace(/Topics[\s\S]*$/g, '')
    .replace(/Subscribe for the industry[\s\S]*?Privacy Notice\./g, '')
    .replace(/Every weekday and Sunday[\s\S]*?Privacy Notice\./g, '')
    .replace(/By submitting your email[\s\S]*?Privacy Notice\./g, '')
    .replace(/Privacy Notice\./g, '')
    .replace(/Startups are the core[\s\S]*?Privacy Notice\./g, '')

    // Remove flag emojis
    .replace(/\ud83c\uddec\ud83c\uddea|\ud83c\uddef\ud83c\uddf5|\ud83c\uddfa\ud83c\uddf8|\ud83c\uddea\ud83c\uddfa|\ud83c\uddec\ud83c\udde7|\ud83c\udde9\ud83c\uddea|\ud83c\uddeb\ud83c\uddf7|\ud83c\uddee\ud83c\uddf9|\ud83c\uddea\ud83c\uddf8|\ud83c\uddf7\ud83c\uddfa|\ud83c\udde8\ud83c\uddf3|\ud83c\uddf0\ud83c\uddf7|\ud83c\uddee\ud83c\uddf3|\ud83c\udde7\ud83c\uddf7|\ud83c\uddf2\ud83c\uddfd|\ud83c\udde8\ud83c\udde6|\ud83c\udde6\ud83c\uddfa|\ud83c\uddf3\ud83c\uddff|\ud83c\uddff\ud83c\udde6|\ud83c\uddef\ud83c\uddf5/g, '')

    // Replace markdown headings with HTML headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')

    // Remove Russian text
    .replace(/[а-яА-Я]+/g, '')

    // Remove "Related Articles" section and everything after it
    .replace(/Related Articles[\s\S]*$/g, '')

    // Remove "関連情報" section and everything after it
    .replace(/関連情報[\s\S]*$/g, '')

    // Remove emojis with a simpler approach that won't cause syntax errors
    .replace(/[\u1F300-\u1F5FF]/g, '');

  // Remove any trailing whitespace
  cleanedContent = cleanedContent.trim();

  return cleanedContent;
}

module.exports = { cleanupContent };
