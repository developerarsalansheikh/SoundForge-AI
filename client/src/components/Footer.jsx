import React from 'react'

const Footer = () => {
  return (
   <footer className="bg-gray-900/80 border-t border-purple-900 mt-12 py-6 text-center text-gray-500 w-full">
    <div className="max-w-full mx-auto px-4 text-sm">
      <p>&copy; {new Date().getFullYear()} AI.VIBE Studio. Drop a Banger. 🚀</p>
      <p className="mt-2 text-xs">Gen-Z Aesthetic UI by Gemini.</p>
    </div>
  </footer>
  )
}

export default Footer
