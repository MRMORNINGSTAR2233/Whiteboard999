"use client"

import { UserProfile } from "@/types/profile"

interface ProfileStatsProps {
  profile: UserProfile
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  const stats = [
    {
      label: "Whiteboards Created",
      value: profile.stats.whiteboardCount,
      icon: "📋",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Shared Whiteboards",
      value: profile.stats.sharedWhiteboardCount,
      icon: "🤝",
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Comments",
      value: profile.stats.commentCount,
      icon: "💬",
      color: "bg-purple-50 text-purple-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center text-2xl`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}

      {/* Account Info Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 md:col-span-3">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Email Verified</p>
            <p className="text-gray-900 font-medium">
              {profile.emailVerified ? (
                <span className="text-green-600">✓ Verified</span>
              ) : (
                <span className="text-yellow-600">⚠ Not Verified</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Last Login</p>
            <p className="text-gray-900 font-medium">
              {profile.lastLoginAt
                ? new Date(profile.lastLoginAt).toLocaleString()
                : "Never"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Account Created</p>
            <p className="text-gray-900 font-medium">
              {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Account Type</p>
            <p className="text-gray-900 font-medium">{profile.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
