import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyMatches, acceptMatch, declineMatch } from '../lib/api'
import { useToast } from '../components/ui/Toast'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card'
import { 
  User, 
  BookOpen, 
  Target, 
  Star, 
  Check, 
  X, 
  Video, 
  LogOut,
  Edit,
  Clock,
  Users
} from 'lucide-react'
import { getInitials } from '../lib/utils'

export default function Dashboard() {
  const { user, logoutUser } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      const response = await getMyMatches()
      setMatches(response.data)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load matches',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (matchId) => {
    try {
      await acceptMatch(matchId)
      toast({
        title: 'Match accepted!',
        description: 'Waiting for the other person to accept'
      })
      loadMatches()
    } catch (error) {
      console.error('Accept match error:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.error || error.message || 'Failed to accept match',
        variant: 'destructive'
      })
    }
  }

  const handleDecline = async (matchId) => {
    try {
      await declineMatch(matchId)
      toast({
        title: 'Match declined',
        description: 'Looking for other matches'
      })
      loadMatches()
    } catch (error) {
      console.error('Decline match error:', error)
      toast({
        title: 'Error',
        description: error.response?.data?.error || error.message || 'Failed to decline match',
        variant: 'destructive'
      })
    }
  }

  const getPartner = (match) => {
    return match.user1.id === user.id ? match.user2 : match.user1
  }

  const hasAccepted = (match) => {
    return match.user1.id === user.id ? match.user1_accepted : match.user2_accepted
  }

  const partnerAccepted = (match) => {
    return match.user1.id === user.id ? match.user2_accepted : match.user1_accepted
  }

  const pendingMatches = matches.filter(m => m.status === 'pending')
  const activeMatches = matches.filter(m => m.status === 'active')
  const completedMatches = matches.filter(m => m.status === 'completed')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                {getInitials(user?.name || 'U')}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span>Trust Score: {user?.trust_score?.toFixed(1) || '0.0'}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/profile')}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="ghost" onClick={logoutUser}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* User Skills Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">I Can Teach</h3>
                  <p className="text-lg text-gray-700">{user?.offer_skill}</p>
                  <span className="text-sm text-muted-foreground">{user?.offer_level}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">I Want to Learn</h3>
                  <p className="text-lg text-gray-700">{user?.want_skill}</p>
                  <span className="text-sm text-muted-foreground">{user?.want_level}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Matches */}
        {activeMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Video className="w-6 h-6 text-primary" />
              Active Sessions
            </h2>
            <div className="grid gap-4">
              {activeMatches.map((match) => {
                const partner = getPartner(match)
                return (
                  <Card key={match.id} className="border-primary">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {getInitials(partner.name)}
                          </div>
                          <div>
                            <button 
                              onClick={() => navigate(`/user/${partner.id}`)}
                              className="font-semibold text-lg hover:text-primary transition-colors text-left"
                            >
                              {partner.name}
                            </button>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Teaches:</span>
                              <span className="font-medium ml-1">{partner.offer_skill}</span>
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => navigate(`/classroom/${match.id}`)}>
                          <Video className="w-4 h-4 mr-2" />
                          Join Classroom
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Pending Matches */}
        {pendingMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Match Requests ({pendingMatches.length})
            </h2>
            <div className="grid gap-4">
              {pendingMatches.map((match) => {
                const partner = getPartner(match)
                const userAccepted = hasAccepted(match)
                const otherAccepted = partnerAccepted(match)

                return (
                  <Card key={match.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-primary font-bold text-xl">
                            {getInitials(partner.name)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => navigate(`/user/${partner.id}`)}
                                className="text-xl font-semibold hover:text-primary transition-colors text-left"
                              >
                                {partner.name}
                              </button>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span className="text-sm">{partner.trust_score?.toFixed(1) || '0.0'}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                              <div className="text-sm">
                                <span className="text-muted-foreground">You teach:</span>
                                <span className="font-medium ml-1 block">{user.offer_skill}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">You learn:</span>
                                <span className="font-medium ml-1 block">{partner.offer_skill}</span>
                              </div>
                            </div>
                            
                            {(userAccepted || otherAccepted) && (
                              <div className="mt-3 flex items-center gap-2 text-sm">
                                {userAccepted && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">
                                    <Check className="w-3 h-3 mr-1" />
                                    You accepted
                                  </span>
                                )}
                                {otherAccepted && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                    <Check className="w-3 h-3 mr-1" />
                                    {partner.name.split(' ')[0]} accepted
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {!userAccepted && (
                          <div className="flex gap-2">
                            <Button onClick={() => handleAccept(match.id)} variant="default">
                              <Check className="w-4 h-4 mr-2" />
                              Accept
                            </Button>
                            <Button onClick={() => handleDecline(match.id)} variant="outline">
                              <X className="w-4 h-4 mr-2" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && pendingMatches.length === 0 && activeMatches.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
              <p className="text-muted-foreground mb-4">
                Our matching engine runs every 10 minutes. Check back soon!
              </p>
              <Button onClick={() => navigate('/profile')}>
                <Edit className="w-4 h-4 mr-2" />
                Update Profile
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
