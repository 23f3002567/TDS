/**
 * @fileoverview This script handles email de-obfuscation and link validation.
 */

/**
 * De-obfuscates email addresses wrapped in <!--email_off--> and <!--/email_off--> comments.
 * It replaces the obfuscated email with a clickable mailto link.
 */
function deobfuscateEmails() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_COMMENT, null, false);
  const commentNodes = [];
  let currentNode;
  while (currentNode = walker.nextNode()) {
    commentNodes.push(currentNode);
  }

  commentNodes.forEach(commentNode => {
    if (commentNode.nodeValue.trim() === 'email_off') {
      const emailTextNode = commentNode.nextSibling;
      if (emailTextNode && emailTextNode.nodeType === Node.TEXT_NODE) {
        const email = emailTextNode.nodeValue.trim();
        const endCommentNode = emailTextNode.nextSibling;
        if (endCommentNode && endCommentNode.nodeType === Node.COMMENT_NODE && endCommentNode.nodeValue.trim() === '/email_off') {
          const mailtoLink = document.createElement('a');
          mailtoLink.href = 'mailto:' + email;
          mailtoLink.textContent = email;
          const parent = commentNode.parentNode;
          parent.replaceChild(mailtoLink, emailTextNode);
          parent.removeChild(commentNode);
          parent.removeChild(endCommentNode);
        }
      }
    }
  });
}

/**
 * Validates links on the page to ensure they are not broken.
 * It sends a HEAD request to the link's href and warns the user if the link is broken.
 */
function validateLinks() {
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const url = this.href;

      // Skip mailto links
      if (url.startsWith('mailto:')) {
        window.location.href = url;
        return;
      }

      fetch(url, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            window.location.href = url;
          } else {
            if (confirm(`The link to "${url}" might be broken. Do you want to continue?`)) {
              window.location.href = url;
            }
          }
        })
        .catch(error => {
          console.error('Error checking link:', error);
          if (confirm(`Could not check the link to "${url}" due to a network error. Do you want to continue?`)) {
            window.location.href = url;
          }
        });
    });
  });
}

/**
 * Initializes the script after the DOM is fully loaded.
 */
document.addEventListener('DOMContentLoaded', function() {
  deobfuscateEmails();
  validateLinks();
});
