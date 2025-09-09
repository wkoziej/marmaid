import { ProfileForm } from '../../features/auth/ProfileForm'

export function ProfilePage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Profil terapeuty</h1>
      <ProfileForm onSuccess={() => {}} onCancel={() => {}} />
    </div>
  )
}
