import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Calendar, Clock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  author_id: string | null;
  category_id: string | null;
  published_at: string;
  tags: string[];
  author?: string;
  category?: string;
  reading_time: number;
}

export default function BlogIndex() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories (name),
          staff (full_name)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const transformedPosts = data.map(post => ({
          ...post,
          author: post.staff?.full_name || 'Anonymous',
          category: post.blog_categories?.name || 'Uncategorized',
          reading_time: calculateReadingTime(post.content),
        }));
        
        setFeaturedPost(transformedPosts[0]);
        setPosts(transformedPosts);
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory && post.id !== featuredPost?.id;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Blog - Go Cargo Logistics"
        description="Latest insights, news, and updates from Go Cargo Logistics. Expert advice on vehicle shipping, freight transportation, and logistics solutions."
      />
      <Navigation />
      
      <div className="min-h-screen bg-background pt-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary via-secondary to-accent overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="container relative">
            <div className="max-w-3xl mx-auto text-center text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-up">
                Logistics Insights & News
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 animate-fade-up [animation-delay:100ms]">
                Expert advice, industry trends, and shipping guides
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-xl mx-auto animate-fade-up [animation-delay:200ms]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 bg-white"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="container py-16">
          {/* Featured Post */}
          {featuredPost && (
            <div className="mb-16 animate-fade-up">
              <h2 className="text-3xl font-bold mb-8">Featured Article</h2>
              <Link href={`/blog/${featuredPost.slug}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="relative h-64 md:h-auto bg-gradient-to-br from-primary to-accent">
                      {featuredPost.featured_image && (
                        <img
                          src={featuredPost.featured_image}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <Badge className="w-fit mb-4">{featuredPost.category}</Badge>
                      <h3 className="text-3xl font-bold mb-4 group-hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h3>
                      <p className="text-muted-foreground mb-6 line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(featuredPost.published_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {featuredPost.reading_time} min read
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                        Read Article <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          )}

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 animate-fade-up [animation-delay:100ms]">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('all')}
              >
                All Articles
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          )}

          {/* Blog Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">No articles found</p>
              </div>
            ) : (
              filteredPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer group">
                    <div className="relative h-48 bg-gradient-to-br from-primary to-accent overflow-hidden">
                      {post.featured_image && (
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <CardHeader>
                      <Badge className="w-fit mb-2">{post.category}</Badge>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(post.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {post.reading_time} min
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}