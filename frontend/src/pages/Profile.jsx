import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { ArrowRight, User, BookOpen, Target } from 'lucide-react'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    offer_skill: user?.offer_skill || '',
    offer_level: user?.offer_level || 'Intermediate',
    want_skill: user?.want_skill || '',
    want_level: user?.want_level || 'Beginner',
    timezone: user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        offer_skill: user.offer_skill || '',
        offer_level: user.offer_level || 'Intermediate',
        want_skill: user.want_skill || '',
        want_level: user.want_level || 'Beginner',
        timezone: user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    }
  }, [user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await updateProfile(formData)
      updateUser(response.data.user)
      
      toast({
        title: 'Profile updated!',
        description: 'Your profile has been saved successfully'
      })

      navigate('/dashboard')
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error.response?.data?.error || 'Failed to update profile',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">Tell us what you can teach and what you want to learn</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              We'll use this to match you with the perfect learning partner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Your Name</label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">What Can You Teach?</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Skill You Offer</label>
                    <Input
                      name="offer_skill"
                      value={formData.offer_skill}
                      onChange={handleChange}
                      placeholder="e.g., Advanced Excel Modeling, Web Development"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Your Level</label>
                    <Select
                      name="offer_level"
                      value={formData.offer_level}
                      onChange={handleChange}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">What Do You Want to Learn?</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Skill You Want</label>
                    <Input
                      name="want_skill"
                      value={formData.want_skill}
                      onChange={handleChange}
                      placeholder="e.g., Python Programming, Graphic Design"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Desired Level</label>
                    <Select
                      name="want_level"
                      value={formData.want_level}
                      onChange={handleChange}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <Input
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    placeholder="e.g., America/New_York"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
                  </p>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile & Find Matches'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
