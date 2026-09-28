import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/kit/ui/table"
import { initialProjects as projects } from "@/demo/project-fixtures"

export function TableExample() {
  return (
    <Table>
      <TableCaption>Sample projects · completed tasks</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">Project</TableHead>
          <TableHead scope="col" className="text-right">
            Completed
          </TableHead>
          <TableHead scope="col" className="text-right">
            Total
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.slice(0, 3).map((project) => (
          <TableRow key={project.id}>
            <TableCell>{project.name}</TableCell>
            <TableCell className="text-right">
              {project.completedTasks}
            </TableCell>
            <TableCell className="text-right">{project.tasks}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
