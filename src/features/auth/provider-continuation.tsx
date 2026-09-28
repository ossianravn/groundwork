import { Button } from "@/kit/ui/button"
import { Avatar, AvatarFallback } from "@/kit/ui/avatar"
import { profileInitials } from "@/demo/use-account"

export function ProviderContinuation({
  profile,
  onContinue,
}: {
  profile: { name: string; email: string }
  onContinue: () => void
}) {
  return (
    <div className="provider-continuation">
      <div className="provider-account">
        <Avatar>
          <AvatarFallback>{profileInitials(profile.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{profile.name}</p>
          <p className="text-muted-foreground">{profile.email}</p>
        </div>
      </div>
      <Button onClick={onContinue}>Continue</Button>
    </div>
  )
}
