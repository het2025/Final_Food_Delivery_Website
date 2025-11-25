// // src/components/TrackOrderModal.jsx
// import React, { useEffect } from 'react'
// import HeroDeliveryAnimation from './HeroDeliveryAnimation'

// /**
//  * TrackOrderModal
//  * - Props:
//  *    - open (bool)
//  *    - onClose (fn)
//  *    - onFinished (fn) called when animation completes
//  *    - durationMs (number)
//  */
// const TrackOrderModal = ({ open = false, onClose = () => {}, onFinished = () => {}, durationMs = 4000 }) => {
//   useEffect(() => {
//     if (!open) return
//     const t = setTimeout(() => {
//       onFinished()
//     }, durationMs + 200) // slight buffer
//     return () => clearTimeout(t)
//   }, [open, durationMs, onFinished])

//   if (!open) return null

//   return (
//     <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/50">
//       <div className="overflow-hidden relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl">
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/90 hover:bg-white"
//           aria-label="Close"
//         >
//           ✕
//         </button>
//         <div className="p-6">
//           <HeroDeliveryAnimation durationMs={durationMs} />
//         </div>
//       </div>
//     </div>
//   )
// }

// export default TrackOrderModal
