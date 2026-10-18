import { Play } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { useSpeechOutput } from "@/kit/voice/speech-output"
import { Transcription } from "@/kit/voice/transcription"

const line =
  "Mobile app is due in five days with a third of its tasks still open. Atlas launch is on track."

export function TranscriptionExample() {
  // Silent here: the words follow a speaking pace without playing sound.
  const { speak, progress } = useSpeechOutput({ audible: false })

  return (
    <div className="grid max-w-md justify-items-start gap-(--gap-group)">
      <Transcription
        className="text-base"
        text={line}
        position={progress?.position ?? Number.POSITIVE_INFINITY}
      />
      <Button variant="outline" onClick={() => void speak(line)}>
        <Play aria-hidden="true" />
        Play
      </Button>
    </div>
  )
}
