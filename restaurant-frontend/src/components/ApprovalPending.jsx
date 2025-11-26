import React from 'react';
import { Clock, Mail, Phone, LogOut, RefreshCw } from 'lucide-react';

/**
 * Component shown when restaurant owner is pending approval
 * Blocks all dashboard interactions until admin approves
 */
function ApprovalPending({ onLogout, onRefresh, refreshing }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/95">
            <div className="w-full max-w-md">
                {/* Main Card */}
                <div className="overflow-hidden bg-white shadow-2xl rounded-2xl">
                    {/* Header with gradient */}
                    <div className="p-8 text-center text-white bg-gradient-to-r from-orange-500 to-red-600">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                                <Clock className="w-12 h-12 animate-pulse" />
                            </div>
                        </div>
                        <h1 className="mb-2 text-2xl font-bold">Approval Pending</h1>
                        <p className="text-sm text-white/90">Your restaurant registration is under review</p>
                    </div>

                    {/* Body */}
                    <div className="p-8 space-y-6">
                        {/* Status Message */}
                        <div className="p-4 border-l-4 border-orange-500 rounded-lg bg-orange-50">
                            <h3 className="mb-1 font-semibold text-gray-800">Thank you for registering with QuickBite!</h3>
                            <p className="text-sm text-gray-600">
                                Our team is reviewing your restaurant details. You'll be able to access all dashboard features once approved.
                            </p>
                        </div>

                        {/* What's Next */}
                        <div>
                            <h4 className="mb-3 text-sm font-semibold text-gray-700 uppercase">What happens next?</h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-5 h-5 mt-0.5 text-orange-500">✓</span>
                                    <span>Our team reviews your restaurant information</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-5 h-5 mt-0.5 text-orange-500">✓</span>
                                    <span>You'll receive an email notification once approved</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="flex-shrink-0 w-5 h-5 mt-0.5 text-orange-500">✓</span>
                                    <span>Full dashboard access will be granted immediately</span>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div className="pt-4 border-t border-gray-200">
                            <p className="mb-2 text-xs font-semibold text-gray-500 uppercase">Need help?</p>
                            <div className="space-y-2">
                                <a
                                    href="mailto:support@quickbite.com"
                                    className="flex items-center gap-2 text-sm text-gray-700 transition-colors hover:text-orange-600"
                                >
                                    <Mail className="w-4 h-4" />
                                    support@quickbite.com
                                </a>
                                <a
                                    href="tel:+911234567890"
                                    className="flex items-center gap-2 text-sm text-gray-700 transition-colors hover:text-orange-600"
                                >
                                    <Phone className="w-4 h-4" />
                                    +91 123 456 7890
                                </a>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={onRefresh}
                                disabled={refreshing}
                                className="flex items-center justify-center flex-1 gap-2 px-4 py-3 text-sm font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                                {refreshing ? 'Checking...' : 'Check Status'}
                            </button>
                            <button
                                onClick={onLogout}
                                className="flex items-center justify-center flex-1 gap-2 px-4 py-3 text-sm font-medium text-white transition-opacity bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:opacity-90"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer note */}
                <p className="mt-4 text-xs text-center text-gray-400">
                    Approval typically takes 24-48 hours
                </p>
            </div>
        </div>
    );
}

export default ApprovalPending;
