import { Button } from "@/kit/ui/button"
import { FieldSeparator } from "@/kit/ui/field"
import { GoogleIcon, GitHubIcon } from "@/components/brand-icons"
import { providers, type ProviderId } from "@/demo/provider-access"

export function ProviderButtons({
  onChoose,
}: {
  onChoose: (provider: ProviderId) => void
}) {
  return (
    <div className="provider-options">
      <div
        className="provider-buttons"
        role="group"
        aria-label="Continue with a provider (demo)"
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => onChoose("google")}
          aria-label="Continue with Google (demo)"
        >
          <GoogleIcon data-icon="inline-start" />
          {providers.google.name}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onChoose("github")}
          aria-label="Continue with GitHub (demo)"
        >
          <GitHubIcon data-icon="inline-start" />
          {providers.github.name}
        </Button>
      </div>
      <FieldSeparator>Or use email</FieldSeparator>
    </div>
  )
}
