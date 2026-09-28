import { useState } from "react"
import { CircleAlert, Check } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/kit/ui/alert"
import { Button } from "@/kit/ui/button"

export function AlertExample() {
  const [failed, setFailed] = useState(true)

  return (
    <div className="grid w-full max-w-md gap-3">
      <Alert
        variant={failed ? "destructive" : "default"}
        role={failed ? "alert" : "status"}
      >
        {failed ? (
          <CircleAlert aria-hidden="true" />
        ) : (
          <Check aria-hidden="true" />
        )}
        <AlertTitle>
          {failed ? "Changes weren't saved" : "Changes saved"}
        </AlertTitle>
        <AlertDescription>
          {failed
            ? "Your draft is still here. Try saving it again."
            : "The preview has recovered."}
        </AlertDescription>
      </Alert>
      {failed && (
        <Button
          variant="outline"
          className="justify-self-start"
          onClick={() => setFailed(false)}
        >
          Try again
        </Button>
      )}
    </div>
  )
}
