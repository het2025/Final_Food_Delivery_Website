import React, { useState } from "react";
import { motion } from "framer-motion";

// Navbar with minimal re-renders and only logo is animated
function Navbar({ onLoginClick, onRegisterClick }) {
  const [scrolled, setScrolled] = useState(false);

  // Lightweight scroll handler
  React.useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 1);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 duration-400 ${scrolled ? "py-2 shadow-xl backdrop-blur-xl bg-white/95" : "py-4 bg-transparent"}`}>
      <div className="flex justify-between items-center px-4 mx-auto max-w-7xl">
        <div className="flex gap-3 items-center">
          {/* Animate only logo */}
          <motion.img
            src="/quickbite_logo.svg"
            alt="Quickbite Logo"
            className="object-contain w-14 h-14 rounded-full shadow-lg"
            whileHover={{ rotate: 15, scale: 1.07 }}
            transition={{ type: "spring", stiffness: 240 }}
            loading="lazy"
          />
          <span className={`text-2xl font-bold ${scrolled ? "text-gray-900" : "text-white"}`}>QB - Restaurant</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onLoginClick}
            className={`px-4 py-2 rounded-full font-medium ${scrolled
              ? "text-red-600 bg-transparent border border-red-600 hover:bg-red-50"
              : "text-white border bg-white/20 border-white/30 hover:bg-white/30"}`}
          >
            Login
          </button>
          <button
            onClick={onRegisterClick}
            className={`px-4 py-2 rounded-full font-medium ${scrolled
              ? "text-white bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
              : "text-red-600 bg-white hover:bg-gray-100"}`}
          >
            Register
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroWithInfoSection({ onRegisterClick, onLoginClick }) {
  // VIDEO: lazy load for perf
  const [showVideo, setShowVideo] = useState(false);

  React.useEffect(() => {
    // Show the video after first mount, so it's offloaded from first paint
    const timer = setTimeout(() => setShowVideo(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f5f0] to-[#f0e6d9] overflow-x-hidden">
      <Navbar onLoginClick={onLoginClick} onRegisterClick={onRegisterClick} />

      {/* HERO SECTION */}
      <section className="relative min-h-[80vh] w-full overflow-hidden pt-16">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/image1.jpg"
          className="object-cover absolute inset-0 z-0 w-full h-full"
          style={{ minHeight: '100%', minWidth: '110%' }}
        >
          <source src="/video3.mp4" type="video/mp4" />
          <source src="/food-background.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
        {/* Softer gradient overlay for better video visibility */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(120deg, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.44) 55%, rgba(0,0,0,0.62) 100%)"
          }}
        />
        {/* Hero content here */}
        <div className="relative z-20 flex flex-col items-center justify-center min-h-[70vh] text-center px-4 sm:px-6 py-24">
          <div className="max-w-4xl">
            <h1 className="mb-6 text-4xl font-extrabold text-white drop-shadow-xl md:text-6xl">
              <span
                className="inline-block"
                style={{
                  backgroundImage: "linear-gradient(90deg, #f59e0b, #ef4444, #f97316)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                Delight Your Customers
              </span>
              <br />
              <span className="text-white">With Exceptional Food Delivery</span>
            </h1>
            <p className="mx-auto mb-7 max-w-2xl text-lg text-gray-200 md:text-2xl">
              Join thousands of restaurants optimizing their operations and reaching more customers with Quickbite.
            </p>
            <div className="flex flex-col gap-4 justify-center sm:flex-row">
              <button
                onClick={onRegisterClick}
                className="px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-red-600 to-orange-600 rounded-xl shadow-md transition hover:from-red-700 hover:to-orange-600 active:scale-95"
              >
                Register Your Restaurant
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* INFO SECTION */}
      <section className="px-4 py-16 bg-white md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-4xl font-extrabold text-gray-900 md:text-5xl">
              Why Restaurants <span className="text-red-600">Love</span> Quickbite
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Our platform is designed to help you grow your business, delight customers, and streamline operations.
            </p>
          </div>

          {/* Cards (light hover) */}
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {/* Card 1 */}
            <div className="p-7 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-lg transition-transform hover:shadow-xl hover:-translate-y-2">
              <div className="flex justify-center items-center mb-4 w-12 h-12 bg-gradient-to-r from-red-100 to-orange-100 rounded-full shadow">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-800">
                Boost Your Visibility
              </h3>
              <p className="text-sm text-gray-600">
                Get discovered by thousands of hungry customers. Our platform puts your restaurant in front of the right audience.
              </p>
            </div>
            {/* Card 2 */}
            <div className="p-7 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-lg transition-transform hover:shadow-xl hover:-translate-y-2">
              <div className="flex justify-center items-center mb-4 w-12 h-12 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full shadow">
                <span className="text-2xl">⏱️</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-800">
                Streamline Operations
              </h3>
              <p className="text-sm text-gray-600">
                Manage orders in real-time and optimize your kitchen workflow with our dashboard.
              </p>
            </div>
            {/* Card 3 */}
            <div className="p-7 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-lg transition-transform hover:shadow-xl hover:-translate-y-2">
              <div className="flex justify-center items-center mb-4 w-12 h-12 bg-gradient-to-r from-yellow-100 to-green-100 rounded-full shadow">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="mb-3 text-xl font-bold text-gray-800">
                Increase Revenue
              </h3>
              <p className="text-sm text-gray-600">
                With analytics, you can identify trends, optimize your menu, and maximize profits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="bg-[#f9f5f0] py-14 px-4 md:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
              Frequently Asked <span className="text-red-600">Questions</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600">
              Everything you need about joining Quickbite.
            </p>
          </div>
          <div className="flex flex-col gap-4 mx-auto max-w-4xl">
            {/* FAQ Items, compact */}
            {[
              { q: "What documents are required for registration?", a: "You need a PAN card, FSSAI license, bank details, and optionally GST number/menu image." },
              { q: "How long does approval take?", a: "Account approval and onboarding typically take less than 48 hours." },
              { q: "Can I manage orders via mobile?", a: "Yes! You'll have access to our mobile dashboard for on-the-go management." },
              { q: "What is the commission?", a: "Our commission structure is competitive and based on volume. Contact us for details." },
              { q: "Customer support?", a: "Our team provides 24/7 customer support, so you can focus on food not calls." },
            ].map((item, i) => (
              <div key={i} className="p-5 bg-white rounded-xl border border-gray-100 shadow hover:shadow-xl">
                <h3 className="flex items-center mb-1 text-base font-semibold text-gray-800">
                  <span className={`flex justify-center items-center mr-2 w-7 h-7 text-red-600 bg-red-100 rounded-full`}>{i+1}</span>
                  {item.q}
                </h3>
                <p className="pl-10 text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-4 py-9 text-white bg-black bg-opacity-95">
        <div className="grid grid-cols-1 gap-8 mx-auto max-w-7xl text-xs md:grid-cols-4">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center mb-2 space-x-2">
              <img
                src="/quickbite_logo.svg"
                alt="Quickbite Logo"
                className="object-contain w-8 h-8 rounded-full shadow"
                loading="lazy"
              />
              <span className="text-base font-semibold text-white">Quickbite</span>
            </div>
            <p className="mb-3 text-gray-300">
              Empowering restaurants to succeed in the digital age.
            </p>
          </div>
          {/* For Restaurants */}
          <div>
            <h4 className="mb-2 font-semibold text-white">For Restaurants</h4>
            <ul className="space-y-1 text-gray-300">
              {['Partner With Us', 'Dashboard', 'Order Management', 'Marketing Tools', 'Pricing'].map((item, i) => (
                <li key={i} className="flex items-center cursor-pointer hover:text-white">
                  <span className="mr-2">→</span> {item}
                </li>
              ))}
            </ul>
          </div>
          {/* Resources */}
          <div>
            <h4 className="mb-2 font-semibold text-white">Resources</h4>
            <ul className="space-y-1 text-gray-300">
              {['Blog', 'Help Center', 'Community', 'Webinars', 'Documentation'].map((item, i) => (
                <li key={i} className="flex items-center cursor-pointer hover:text-white">
                  <span className="mr-2">→</span> {item}
                </li>
              ))}
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h4 className="mb-2 font-semibold text-white">Contact Us</h4>
            <ul className="space-y-1 text-gray-300">
              <li>support@quickbite.com</li>
              <li>+91 8935741583</li>
              <li>Vadodara, Gujarat, India</li>
            </ul>
          </div>
        </div>
        <div className="mt-7 text-xs text-center text-gray-500">
          © 2025 Quickbite. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default HeroWithInfoSection;
