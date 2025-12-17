export type Project = {
  id: string
  created_at: string
  title: string
  description: string | null
  short_description: string | null
  image_url: string | null
  repo_url: string | null
  demo_url: string | null
  tags: string[] | null
  is_featured: boolean
}
