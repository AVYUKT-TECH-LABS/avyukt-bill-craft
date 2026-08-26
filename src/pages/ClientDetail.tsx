import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getClient, getProjectsForClient, createProject, Client, Project } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";

const ClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const refresh = () => {
    if (!clientId) return;
    Promise.all([getClient(clientId), getProjectsForClient(clientId)])
      .then(([c, p]) => {
        setClient(c);
        setProjects(p);
      })
      .finally(() => setLoading(false));
  };

  useEffect(refresh, [clientId]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !newProjectName.trim()) return;
    setSubmitting(true);
    try {
      await createProject({ client_id: clientId, name: newProjectName.trim() });
      setNewProjectName("");
      refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!client) return <p className="text-muted-foreground">Client not found.</p>;

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{client.name}</h1>
        {client.email && <p className="text-sm text-muted-foreground">{client.email}</p>}
        {client.address && <p className="text-sm text-muted-foreground">{client.address}</p>}
        {client.state && <p className="text-sm text-muted-foreground">{client.state}</p>}
        {client.gstin && <p className="text-sm text-muted-foreground">GSTIN: {client.gstin}</p>}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Projects</h2>
        <form onSubmit={handleCreateProject} className="flex gap-2 max-w-md">
          <Input
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project name"
          />
          <Button type="submit" disabled={submitting || !newProjectName.trim()} className="gap-2">
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </form>

        {projects.length === 0 ? (
          <p className="text-muted-foreground">No projects yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link key={project.id} to={`/clients/${clientId}/projects/${project.id}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-4">
                    <p className="font-semibold text-foreground">{project.name}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetail;
