import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  X,
  Pause,
  DollarSign,
  MessageSquare,
  Gift,
  Clock,
  Sparkles,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CancellationFlowProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionEndDate: string;
  planName: string;
  planPrice: string;
  onConfirmCancel?: (endDate: string) => void;
}

type CancellationStep = 'reason' | 'offer' | 'warning' | 'confirm' | 'success';

interface CancellationReason {
  id: string;
  label: string;
  description?: string;
  offer?: 'discount' | 'pause' | 'support' | 'downgrade' | null;
}

const cancellationReasons: CancellationReason[] = [
  { id: 'too-expensive', label: 'Too expensive', description: "The subscription doesn't fit my budget", offer: 'discount' },
  { id: 'not-using', label: "I'm not using it enough", description: "I don't use the product frequently", offer: 'pause' },
  { id: 'missing-features', label: 'Missing features I need', description: "The product doesn't have what I'm looking for", offer: 'support' },
  { id: 'switching', label: 'Switching to a different product', description: "I found an alternative solution", offer: null },
  { id: 'technical-issues', label: 'Technical issues', description: "I've experienced bugs or problems", offer: 'support' },
  { id: 'temporary', label: 'Just need a break', description: "I'll be back later", offer: 'pause' },
  { id: 'other', label: 'Other reason', description: 'Something else not listed here', offer: null },
];

const whatYouLose = [
  '100,000 monthly credits (reduced to 10,000)',
  'Priority support',
  'Advanced analytics',
  'White-label options',
  'AI video generation',
  'Team collaboration features',
];

const whatYouKeep = [
  'Your account and data',
  'All previously created content',
  'Access to basic features',
  'Community access',
];

export default function CancellationFlow({
  isOpen,
  onClose,
  subscriptionEndDate,
  planName,
  planPrice,
  onConfirmCancel
}: CancellationFlowProps) {
  const [step, setStep] = useState<CancellationStep>('reason');
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedReasonData = cancellationReasons.find(r => r.id === selectedReason);

  const handleClose = () => {
    setStep('reason');
    setSelectedReason('');
    setFeedback('');
    onClose();
  };

  const handleBack = () => {
    switch (step) {
      case 'offer': setStep('reason'); break;
      case 'warning': setStep(selectedReasonData?.offer ? 'offer' : 'reason'); break;
      case 'confirm': setStep('warning'); break;
      default: break;
    }
  };

  const handleNext = () => {
    switch (step) {
      case 'reason':
        setStep(selectedReasonData?.offer ? 'offer' : 'warning');
        break;
      case 'offer': setStep('warning'); break;
      case 'warning': setStep('confirm'); break;
      case 'confirm': handleCancelSubscription(); break;
      default: break;
    }
  };

  const handleAcceptOffer = () => {
    handleClose();
  };

  const handleCancelSubscription = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setStep('success');
    onConfirmCancel?.(subscriptionEndDate);
  };

  const renderStepIndicator = () => {
    const steps = ['reason', 'offer', 'warning', 'confirm'];
    const currentIndex = steps.indexOf(step);
    if (step === 'success') return null;

    return (
      <div className="flex items-center justify-center gap-2 mb-4">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={cn("w-2 h-2 rounded-full transition-colors", i <= currentIndex ? "bg-red-500" : "bg-foreground/[0.12]")} />
            {i < steps.length - 1 && (
              <div className={cn("w-6 h-0.5 mx-1 transition-colors", i < currentIndex ? "bg-red-500" : "bg-foreground/[0.12]")} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderReasonStep = () => (
    <div className="space-y-3">
      <div className="text-center">
        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-amber-100 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-amber-600" />
        </div>
        <DialogTitle className="text-lg font-semibold mb-1">We're Sorry To See You Go</DialogTitle>
        <DialogDescription className="text-sm text-muted">
          Before you cancel, please let us know why you're leaving so we can improve.
        </DialogDescription>
      </div>

      <RadioGroup value={selectedReason} onValueChange={setSelectedReason} className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
        {cancellationReasons.map((reason) => (
          <div
            key={reason.id}
            className={cn(
              "flex items-start space-x-2 p-2.5 rounded-lg border-2 transition-all cursor-pointer",
              selectedReason === reason.id ? "border-red-500 bg-red-500/5" : "border-foreground/[0.08] hover:border-foreground/[0.15]"
            )}
            onClick={() => setSelectedReason(reason.id)}
          >
            <RadioGroupItem value={reason.id} id={reason.id} className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor={reason.id} className="text-sm font-medium cursor-pointer">{reason.label}</Label>
              {reason.description && <p className="text-xs text-muted">{reason.description}</p>}
            </div>
          </div>
        ))}
      </RadioGroup>

      {selectedReason === 'other' && (
        <div className="space-y-1">
          <Label htmlFor="feedback" className="text-sm font-medium">Please tell us more (optional)</Label>
          <Textarea
            id="feedback"
            placeholder="What could we have done better?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="resize-none border-2 border-foreground/[0.08]"
            rows={2}
          />
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button variant="outline" className="flex-1 border-2 border-foreground/[0.08]" onClick={handleClose}>Never Mind</Button>
        <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" onClick={handleNext} disabled={!selectedReason}>Continue</Button>
      </div>
    </div>
  );

  const renderOfferStep = () => {
    const offerType = selectedReasonData?.offer;

    let offerContent = null;

    switch (offerType) {
      case 'discount':
        offerContent = (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
              <Gift className="w-8 h-8 text-accent" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Wait! We Have A Special Offer For You</h3>
              <p className="text-muted">We'd love to keep you! Here's an exclusive discount:</p>
            </div>
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 text-center">
              <div className="text-4xl font-bold text-accent mb-2">50% OFF</div>
              <p className="text-sm text-muted mb-1">for the next 3 months</p>
              <p className="text-lg font-semibold">
                <span className="line-through text-muted mr-2">{planPrice}</span>
                $24.50/month
              </p>
            </div>
          </div>
        );
        break;
      case 'pause':
        offerContent = (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center">
              <Pause className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Need A Break? Pause Instead!</h3>
              <p className="text-muted">No need to cancel. Pause your subscription and come back when you're ready.</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Clock className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-medium">Pause for 1 month</p>
                  <p className="text-sm text-muted">No charges during pause</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Sparkles className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-medium">Keep all your data</p>
                  <p className="text-sm text-muted">Everything will be here when you return</p>
                </div>
              </div>
            </div>
          </div>
        );
        break;
      case 'support':
        offerContent = (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center">
              <Heart className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Let's Fix This Together</h3>
              <p className="text-muted">We want to make things right. Talk to our support team for personalized help.</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <MessageSquare className="w-6 h-6 text-purple-500" />
                <div>
                  <p className="font-medium">Priority support chat</p>
                  <p className="text-sm text-muted">Get help within 5 minutes</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <DollarSign className="w-6 h-6 text-purple-500" />
                <div>
                  <p className="font-medium">Free account credit</p>
                  <p className="text-sm text-muted">$25 bonus credits for your trouble</p>
                </div>
              </div>
            </div>
          </div>
        );
        break;
    }

    return (
      <div className="space-y-6">
        {offerContent}
        <div className="flex flex-col gap-3 pt-4">
          <Button className="w-full bg-accent hover:bg-accent/90 text-white" onClick={handleAcceptOffer}>
            {offerType === 'discount' && 'Claim My 50% Discount'}
            {offerType === 'pause' && 'Pause My Subscription'}
            {offerType === 'support' && 'Chat With Support'}
          </Button>
          <Button variant="ghost" className="w-full text-muted" onClick={handleNext}>
            No Thanks, Continue Canceling
          </Button>
        </div>
      </div>
    );
  };

  const renderWarningStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-100 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-amber-600" />
        </div>
        <DialogTitle className="text-xl font-semibold mb-2">Before You Cancel</DialogTitle>
        <DialogDescription className="text-muted">
          Here's what happens when you cancel your {planName} subscription:
        </DialogDescription>
      </div>

      <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-3 h-3 text-red-500" />
            </div>
            <h4 className="font-semibold">What You'll Lose</h4>
          </div>
          <ul className="space-y-2">
            {whatYouLose.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted">
                <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600" />
            </div>
            <h4 className="font-semibold">What You'll Keep</h4>
          </div>
          <ul className="space-y-2">
            {whatYouKeep.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted">
                <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button className="flex-1 bg-foreground text-primary-foreground hover:bg-foreground/90" onClick={handleClose}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Keep My Subscription
        </Button>
        <Button variant="outline" className="flex-1 text-red-500 border-red-200 hover:bg-red-50" onClick={handleNext}>
          Continue To Cancel
        </Button>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <DialogTitle className="text-xl font-semibold mb-2">Confirm Cancellation</DialogTitle>
        <DialogDescription className="text-muted">Are you sure you want to cancel your subscription?</DialogDescription>
      </div>

      <div className="bg-foreground/[0.03] rounded-xl p-6 text-center">
        <p className="text-sm text-muted mb-2">Your subscription will remain active until</p>
        <p className="text-2xl font-bold">{subscriptionEndDate}</p>
        <p className="text-sm text-muted mt-2">After this date, your account will be downgraded to the free plan.</p>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <Button className="w-full bg-foreground text-primary-foreground hover:bg-foreground/90" onClick={handleClose}>
          I'll Think About It...
        </Button>
        <Button variant="outline" className="w-full text-red-500 border-red-200 hover:bg-red-50" onClick={handleNext} disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Yes, Cancel Subscription'}
        </Button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-foreground/[0.05] flex items-center justify-center">
          <Check className="w-8 h-8 text-muted" />
        </div>
        <DialogTitle className="text-xl font-semibold mb-2">Your Subscription Has Been Cancelled</DialogTitle>
        <DialogDescription className="text-muted">We're sorry to see you go! Your feedback helps us improve.</DialogDescription>
      </div>

      <div className="bg-foreground/[0.03] rounded-xl p-6 space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted mb-1">Your account is still active until</p>
          <p className="text-lg font-bold">{subscriptionEndDate}</p>
        </div>
        <div className="pt-4 border-t border-foreground/[0.06] text-center">
          <p className="text-sm font-medium mb-1">Changed Your Mind?</p>
          <p className="text-sm text-muted">You can reactivate your subscription at any time before this date.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <Button className="w-full bg-accent hover:bg-accent/90 text-white" onClick={handleClose}>Reactivate Subscription</Button>
        <Button variant="ghost" className="w-full" onClick={handleClose}>Close</Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="sr-only">
          <DialogTitle>Cancel Subscription</DialogTitle>
          <DialogDescription>Steps to cancel your subscription</DialogDescription>
        </DialogHeader>

        <div className="p-5">
          {step !== 'success' && step !== 'reason' && (
            <Button variant="ghost" size="sm" className="absolute left-4 top-4 text-muted" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          )}

          {renderStepIndicator()}

          {step === 'reason' && renderReasonStep()}
          {step === 'offer' && renderOfferStep()}
          {step === 'warning' && renderWarningStep()}
          {step === 'confirm' && renderConfirmStep()}
          {step === 'success' && renderSuccessStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
