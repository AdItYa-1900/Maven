import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { 
  BookOpen, 
  Users, 
  Video, 
  Palette, 
  MessageSquare, 
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Clock,
  Globe
} from 'lucide-react'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Maven
                </h1>
                <p className="text-xs text-muted-foreground">Learn by Teaching</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button onClick={() => navigate('/register')}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Peer-to-Peer Learning
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Exchange Skills,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Grow Together
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with people who want to learn what you teach, and teach what you want to learn. 
            Perfect matches, real-time collaboration, all free.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" onClick={() => navigate('/register')} className="text-lg px-8 py-6">
              Start Learning Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="text-lg px-8 py-6">
              Sign In
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t">
            <div>
              <div className="text-3xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-muted-foreground">Free Forever</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">AI</div>
              <div className="text-sm text-muted-foreground">Smart Matching</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">P2P</div>
              <div className="text-sm text-muted-foreground">Direct Learning</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Learn & Teach
          </h2>
          <p className="text-xl text-gray-600">
            A complete platform for peer-to-peer skill exchange
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Smart Matching</CardTitle>
              <CardDescription>
                Our AI algorithm finds perfect learning partners based on your skills, level, and timezone
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Video Classroom</CardTitle>
              <CardDescription>
                HD video calls with screen sharing for face-to-face learning experiences
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Palette className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Collaborative Whiteboard</CardTitle>
              <CardDescription>
                Draw, sketch, and share ideas in real-time with an interactive whiteboard
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>Persistent Chat</CardTitle>
              <CardDescription>
                Text chat with message history to discuss, share resources, and stay connected
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle>Trust Score System</CardTitle>
              <CardDescription>
                Rate your partners and build reputation to connect with quality learners
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle>Global Community</CardTitle>
              <CardDescription>
                Connect with learners worldwide with timezone-aware matching
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Start learning in just 4 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Profile</h3>
              <p className="text-gray-600">
                Tell us what you can teach and what you want to learn
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Matched</h3>
              <p className="text-gray-600">
                Our AI finds perfect partners who complement your skills
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Learning</h3>
              <p className="text-gray-600">
                Join video classroom with whiteboard and chat
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-semibold mb-2">Rate & Repeat</h3>
              <p className="text-gray-600">
                Review your session and build your trust score
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Choose Maven?
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">100% Free</h3>
                  <p className="text-gray-600">No subscription fees, no hidden costs. Exchange skills freely.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Smart Matching</h3>
                  <p className="text-gray-600">AI-powered algorithm finds your perfect learning partner.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Real-Time Collaboration</h3>
                  <p className="text-gray-600">Video, whiteboard, and chat - everything you need in one place.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Trusted Community</h3>
                  <p className="text-gray-600">Rating system ensures quality exchanges and accountability.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Learn Anything</h3>
                  <p className="text-gray-600">From coding to cooking, music to marketing - any skill works.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="pt-6">
                <TrendingUp className="w-8 h-8 text-blue-600 mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">∞</div>
                <div className="text-sm text-gray-600">Skills Available</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="pt-6">
                <Users className="w-8 h-8 text-green-600 mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">1:1</div>
                <div className="text-sm text-gray-600">Personal Attention</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="pt-6">
                <Clock className="w-8 h-8 text-purple-600 mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">24/7</div>
                <div className="text-sm text-gray-600">Find Partners Anytime</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="pt-6">
                <Star className="w-8 h-8 text-orange-600 mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">5★</div>
                <div className="text-sm text-gray-600">Quality Exchanges</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of learners exchanging skills and growing together
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('/register')}
              className="text-lg px-8 py-6"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/login')}
              className="text-lg px-8 py-6 bg-white/10 text-white border-white hover:bg-white/20"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-6 h-6" />
                <span className="font-bold text-lg">Maven</span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting learners worldwide through peer-to-peer skill exchange.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">How It Works</a></li>
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Skill Exchange Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
