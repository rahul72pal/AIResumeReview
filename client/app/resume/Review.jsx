import React, { useState, useEffect } from 'react';

const Review = ({ reviewString }) => {
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    // Simulate a loading effect or typing delay if desired
    const timeout = setTimeout(() => {
      setHtmlContent(reviewString);
    }, 500); // Delay before displaying the full HTML

    return () => clearTimeout(timeout);
  }, [reviewString]);

  return (
    <div
      className="bg-gray-900 w-[80%] mt-10 py-8 px-8 mx-auto text-white p-6 rounded-lg shadow-md overflow-auto max-h-screen"
      style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

export default Review;
