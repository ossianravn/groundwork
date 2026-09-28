import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/kit/ui/tabs"

export function TabsExample() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-sm">
      <TabsList aria-label="Project information" activateOnFocus={false}>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="py-4">
        <h3 className="font-medium">Brand refresh</h3>
        <p className="text-muted-foreground">24 of 32 tasks completed.</p>
      </TabsContent>
      <TabsContent value="activity" className="py-4">
        <h3 className="font-medium">Visual guidelines completed</h3>
        <p className="text-muted-foreground">Ava Morgan · 24 September 2026</p>
      </TabsContent>
    </Tabs>
  )
}
