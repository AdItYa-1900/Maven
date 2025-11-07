import { useState } from 'react'
import { submitReview } from '../../lib/api'
import { useToast } from '../ui/Toast'
import { Button } from '../ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card'
import { Star } from 'lucide-react'

export default function ReviewModal({ matchId, partnerId, partnerName, onComplete }) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    exchange_completed: false,
    rating_teaching: 0,
    rating_exchange: 0,
    comment: ''
  })
  const [loading, setLoading] = useState(false)

  const handleStarClick = (field, value) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.exchange_completed && (formData.rating_teaching === 0 || formData.rating_exchange === 0)) {
      toast({
        title: 'Rating required',
        description: 'Please provide ratings for teaching and exchange quality',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)

    try {
      await submitReview({
        match_id: matchId,
        to_user_id: partnerId,
        rating_teaching: formData.rating_teaching || 3,
        rating_exchange: formData.rating_exchange || 3,
        comment: formData.comment,
        exchange_completed: formData.exchange_completed
      })

      toast({
        title: 'Review submitted!',
        description: 'Thank you for your feedback'
      })

      onComplete()
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to submit review',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const StarRating = ({ value, onChange, label }) => (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${star <= value ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Session Complete</CardTitle>
          <CardDescription>
            How was your experience with {partnerName}?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.exchange_completed}
                  onChange={(e) => setFormData({ ...formData, exchange_completed: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm font-medium">
                  Did you complete the skill exchange successfully?
                </span>
              </label>
            </div>

            {formData.exchange_completed && (
              <>
                <StarRating
                  value={formData.rating_teaching}
                  onChange={(value) => handleStarClick('rating_teaching', value)}
                  label="How would you rate their teaching?"
                />

                <StarRating
                  value={formData.rating_exchange}
                  onChange={(value) => handleStarClick('rating_exchange', value)}
                  label="Overall exchange quality?"
                />

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Additional Comments (Optional)
                  </label>
                  <textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="Share your experience..."
                    className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
