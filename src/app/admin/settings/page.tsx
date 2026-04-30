"use client";

import { useState } from "react";
import { Save, Bell, Shield, Globe, CreditCard } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: "TradeHub",
    supportEmail: "support@tradehub.com",
    currency: "USD",
    enableNotifications: true,
    requireVerification: true,
    autoApproveOrders: false,
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-500 mt-1">Configure platform settings and preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900">General</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Default Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:border-[#FF6A00]"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="EGP">EGP - Egyptian Pound</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900">Notifications</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-neutral-700">Enable email notifications</span>
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                className="w-5 h-5 rounded border-neutral-300 text-[#FF6A00] focus:ring-[#FF6A00]"
              />
            </label>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-neutral-900">Security</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-neutral-700">Require supplier verification</span>
              <input
                type="checkbox"
                checked={settings.requireVerification}
                onChange={(e) => setSettings({ ...settings, requireVerification: e.target.checked })}
                className="w-5 h-5 rounded border-neutral-300 text-[#FF6A00] focus:ring-[#FF6A00]"
              />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-neutral-700">Auto-approve orders under $500</span>
              <input
                type="checkbox"
                checked={settings.autoApproveOrders}
                onChange={(e) => setSettings({ ...settings, autoApproveOrders: e.target.checked })}
                className="w-5 h-5 rounded border-neutral-300 text-[#FF6A00] focus:ring-[#FF6A00]"
              />
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 px-6 py-3 bg-[#FF6A00] text-white rounded-lg font-semibold hover:bg-[#FF8C00] transition">
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
