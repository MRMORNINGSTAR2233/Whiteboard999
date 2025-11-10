"use client"

import { useState } from "react"
import { UserProfile } from "@/types/profile"
import { EditProfileDialog } from "./edit-profile-dialog"

interface ProfileHeaderProps {
  profile: UserProfile
  onUpdate: (updates: { name?: string; image?: string }) => Promise<{ success: boolean; error?: string }>
}

export function ProfileHeader({ profile, onUpdate }: ProfileHeaderProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            <div className="relative">
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={profile.name || "User"}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                  {profile.name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* User Info */}
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.name || "Anonymous User"}
                </h1>
                {/* Role Badge */}
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    profile.role === "ADMIN"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {profile.role}
                </span>
              </div>
              <p className="text-gray-600 mt-1">{profile.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={() => setShowEditDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <EditProfileDialog
        profile={profile}
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        onUpdate={onUpdate}
      />
    </>
  )
}
