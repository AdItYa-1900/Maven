import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getUserById, getUserReviews } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card'
import { User, Star, ArrowLeft, BookOpen, Target, Mail } from 'lucide-react'
import { getInitials } from '../lib/utils'

export default function UserProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [user, setUser] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserProfile()
  }, [userId])

  const loadUserProfile = async () => {
    try {
      const [userResponse, reviewsResponse] = await Promise.all([
        getUserById(userId),
        getUserReviews(userId)
      ])
      
      setUser(userResponse.data)
      setReviews(reviewsResponse.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load user profile',
        variant: 'destructive'
      })
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0
    const total = reviews.reduce((sum, review) => sum + ((review.rating_teaching + review.rating_exchange) / 2), 0)
    return (total / reviews.length).toFixed(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {getInitials(user.name)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                
                {/* Stats */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{calculateAverageRating()}</span>
                    <span className="text-gray-500">({reviews.length} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <span className="font-semibold">{user.trust_score}</span>
                    <span className="text-sm">Trust Score</span>
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <div className="mb-4">
                    <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                  </div>
                )}

                {/* Skills */}
                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold text-green-900">Teaches</h3>
                    </div>
                    <p className="text-green-800 font-medium">{user.offer_skill}</p>
                    <p className="text-sm text-green-600">{user.offer_level} Level</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">Wants to Learn</h3>
                    </div>
                    <p className="text-blue-800 font-medium">{user.want_skill}</p>
                    <p className="text-sm text-blue-600">{user.want_level} Level</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Reviews ({reviews.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No reviews yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div 
                    key={review.id} 
                    className="border-b last:border-0 pb-4 last:pb-0"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                          {getInitials(review.from_user?.name || 'U')}
                        </div>
                        <div>
                          <p className="font-medium">{review.from_user?.name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Teaching: </span>
                          <div className="inline-flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="ml-1 font-medium">{review.rating_teaching}</span>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Exchange: </span>
                          <div className="inline-flex items-center">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            <span className="ml-1 font-medium">{review.rating_exchange}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {review.comment && (
                      <p className="text-gray-700 mt-2 ml-12">{review.comment}</p>
                    )}
                    
                    {review.exchange_completed && (
                      <span className="inline-block ml-12 mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        ✓ Exchange Completed
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
