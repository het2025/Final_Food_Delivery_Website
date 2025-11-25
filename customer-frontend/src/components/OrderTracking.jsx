import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, CheckCircle, Package, TruckIcon, Home } from 'lucide-react'
import './OrderTracking.css'

const OrderTracking = ({ orderId, estimatedTime = 20 }) => {
  const numericEstimated = Number(estimatedTime)
  const safeEstimatedTime =
    Number.isFinite(numericEstimated) && numericEstimated > 0
      ? numericEstimated
      : 20

  const totalSeconds = safeEstimatedTime * 60
  const [orderStatus, setOrderStatus] = useState([
    { 
      id: 1, 
      status: 'Order Placed', 
      description: 'Your order has been placed',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completed: true,
      icon: Package
    },
    { 
      id: 2, 
      status: 'Order Confirmed', 
      description: 'Restaurant confirmed your order',
      time: '',
      completed: false,
      icon: CheckCircle
    },
    { 
      id: 3, 
      status: 'Preparing Food', 
      description: 'Chef is preparing your food',
      time: '',
      completed: false,
      icon: Package
    },
    { 
      id: 4, 
      status: 'Out for Delivery', 
      description: 'Rider is on the way',
      time: '',
      completed: false,
      icon: TruckIcon
    },
    { 
      id: 5, 
      status: 'Delivered', 
      description: 'Order delivered successfully',
      time: '',
      completed: false,
      icon: Home
    }
  ])

  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(totalSeconds)

  // Calculate time per step (in seconds)
  const timePerStep = totalSeconds / (orderStatus.length - 1)

  useEffect(() => {
    // Simulate real-time order progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const increment = totalSeconds > 0 ? 100 / totalSeconds : 0
        const newProgress = prev + increment
        if (newProgress >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return newProgress
      })
    }, 1000) // Update every second

    // Update current step based on progress
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        const nextStep = Math.floor(progress / (100 / orderStatus.length))
        if (nextStep < orderStatus.length) {
          // Update order status
          setOrderStatus(prevStatus => 
            prevStatus.map((item, index) => {
              if (index <= nextStep) {
                return {
                  ...item,
                  completed: true,
                  time: item.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              }
              return item
            })
          )
          return nextStep
        }
        return prev
      })
    }, timePerStep * 1000)

    // Countdown timer
    const timerInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timerInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
      clearInterval(timerInterval)
    }
  }, [estimatedTime, orderStatus.length, progress, timePerStep])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="order-tracking-container">
      {/* Header with Timer */}
      <div className="tracking-header">
        <div className="timer-section">
          <Clock className="w-8 h-8 text-orange-500" />
          <div className="timer-info">
            <p className="text-sm text-gray-500">Estimated Time</p>
            <p className="text-2xl font-bold text-orange-600">
              {timeRemaining > 0 ? formatTime(timeRemaining) : 'Arriving Now!'}
            </p>
          </div>
        </div>
        
        <div className="progress-circle">
          <svg className="progress-ring" width="120" height="120">
            <circle
              className="progress-ring-bg"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
            />
            <circle
              className="progress-ring-progress"
              stroke="#f97316"
              strokeWidth="8"
              fill="transparent"
              r="52"
              cx="60"
              cy="60"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="progress-text">
            <span className="text-2xl font-bold text-orange-600">{Math.round(progress)}%</span>
          </div>
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="tracking-timeline">
        {orderStatus.map((step, index) => {
          const Icon = step.icon
          const isActive = index === currentStep
          const isCompleted = step.completed

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`timeline-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
            >
              {/* Timeline Line */}
              {index < orderStatus.length - 1 && (
                <div className="timeline-line">
                  <motion.div
                    className="timeline-line-progress"
                    initial={{ height: '0%' }}
                    animate={{ 
                      height: isCompleted ? '100%' : isActive ? '50%' : '0%'
                    }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                  />
                </div>
              )}

              {/* Timeline Dot */}
              <div className={`timeline-dot ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                <AnimatePresence mode="wait">
                  {isCompleted ? (
                    <motion.div
                      key="check"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle className="w-6 h-6 text-white" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="icon"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pulse animation for active step */}
                {isActive && !isCompleted && (
                  <motion.div
                    className="pulse-ring"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </div>

              {/* Timeline Content */}
              <div className="timeline-content">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isCompleted || isActive ? 1 : 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className={`timeline-title ${isCompleted ? 'text-green-600' : isActive ? 'text-orange-600' : 'text-gray-400'}`}>
                    {step.status}
                  </h3>
                  <p className={`timeline-description ${isCompleted || isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                    {step.description}
                  </p>
                  {step.time && (
                    <p className="timeline-time">
                      <Clock className="w-4 h-4" />
                      {step.time}
                    </p>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Delivery Info */}
      {progress >= 75 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="delivery-info"
        >
          <div className="delivery-card">
            <TruckIcon className="w-6 h-6 text-orange-500" />
            <div>
              <p className="font-semibold text-gray-800">Delivery Partner</p>
              <p className="text-sm text-gray-600">Ajith - 984●●77001</p>
            </div>
          </div>
          
          <div className="delivery-card">
            <MapPin className="w-6 h-6 text-blue-500" />
            <div>
              <p className="font-semibold text-gray-800">Delivery Address</p>
              <p className="text-sm text-gray-600">TIRUVERKADU, TN</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default OrderTracking
