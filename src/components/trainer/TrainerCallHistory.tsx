import React from 'react'

function TrainerCallHistory() {
  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
      <div className="flex justify-between mb-3">
        <h3 className="font-semibold text-lg text-gray-800"></h3>
        <p className="text-sm text-gray-500">Room ID:</p>
      </div>
      
      <div className="text-sm text-gray-700">
        <p><strong>Call Started:</strong> </p>
        <p><strong>Duration:</strong> </p>
        <p><strong>Status:</strong> </p>
      </div>
    </div>
  )
}

export default TrainerCallHistory