import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, ArrowLeft, Share2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string | null;
  author_id: string | null;
  category_id: string | null;
  published_at: string;
  tags: string[];
  seo_title?: string;
  seo_description?: string;
  author?: string;
  category?: string;
  reading_time: number;
}

interface SimpleBlogPost {
  id: string;
  title: string;
  slug: string;
  published_at: string;
}

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [prevPost, setPrevPost] = useState<SimpleBlogPost | null>(null);
  const [nextPost, setNextPost] = useState<SimpleBlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadPost(slug as string);
    }
  }, [slug]);

  const calculateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const loadPost = async (postSlug: string) => {
    try {
      const { data: postData, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          blog_categories (name),
          staff (full_name)
        `)
        .eq('slug', postSlug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      if (!postData) {
        router.push('/404');
        return;
      }

      const transformedPost = {
        ...postData,
        author: postData.staff?.full_name || 'Anonymous',
        category: postData.blog_categories?.name || 'Uncategorized',
        reading_time: calculateReadingTime(postData.content),
      };

      setPost(transformedPost);

      // Load related posts from same category
      if (postData.category_id) {
        const { data: related } = await supabase
          .from('blog_posts')
          .select(`
            *,
            blog_categories (name),
            staff (full_name)
          `)
          .eq('category_id', postData.category_id)
          .eq('status', 'published')
          .neq('id', postData.id)
          .limit(3);

        if (related) {
          const transformedRelated = related.map(r => ({
            ...r,
            author: r.staff?.full_name || 'Anonymous',
            category: r.blog_categories?.name || 'Uncategorized',
            reading_time: calculateReadingTime(r.content),
          }));
          setRelatedPosts(transformedRelated);
        }
      }

      // Load prev/next posts
      const { data: allPosts } = await supabase
        .from('blog_posts')
        .select('id, title, slug, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (allPosts) {
        const currentIndex = allPosts.findIndex(p => p.id === postData.id);
        if (currentIndex > 0) {
          setPrevPost(allPosts[currentIndex - 1] as SimpleBlogPost);
        }
        if (currentIndex < allPosts.length - 1) {
          setNextPost(allPosts[currentIndex + 1] as SimpleBlogPost);
        }
      }
    } catch (error) {
      console.error('Error loading post:', error);
      router.push('/404');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <>
      <SEO
        title={post.meta_title || `${post.title} - Go Cargo Logistics Blog`}
        description={post.meta_description || post.excerpt}
        image={post.featured_image || undefined}
      />
      <Navigation />
      
      <div className="min-h-screen bg-background pt-20">
        {/* Back Button */}
        <div className="container py-6">
          <Link href="/blog">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <article className="container max-w-4xl pb-16">
          <div className="mb-8">
            <Badge className="mb-4">{post.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-up">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8 animate-fade-up [animation-delay:100ms]">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                  {post.author.charAt(0)}
                </div>
                <span className="font-medium">{post.author}</span>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(post.published_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.reading_time} min read
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="ml-auto"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="relative h-96 mb-12 rounded-xl overflow-hidden animate-fade-up [animation-delay:200ms]">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none animate-fade-up [animation-delay:300ms]"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t">
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="outline">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Prev/Next Navigation */}
          <div className="mt-12 pt-8 border-t">
            <div className="grid md:grid-cols-2 gap-4">
              {prevPost && (
                <Link href={`/blog/${prevPost.slug}`}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <ChevronLeft className="w-4 h-4" />
                      Previous Article
                    </div>
                    <h3 className="font-semibold hover:text-primary transition-colors">
                      {prevPost.title}
                    </h3>
                  </Card>
                </Link>
              )}
              {nextPost && (
                <Link href={`/blog/${nextPost.slug}`} className={!prevPost ? 'md:col-start-2' : ''}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-2">
                      Next Article
                      <ChevronRight className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-right hover:text-primary transition-colors">
                      {nextPost.title}
                    </h3>
                  </Card>
                </Link>
              )}
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 pt-8 border-t">
              <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map(related => (
                  <Link key={related.id} href={`/blog/${related.slug}`}>
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                      <div className="relative h-40 bg-gradient-to-br from-primary to-accent overflow-hidden">
                        {related.featured_image && (
                          <img
                            src={related.featured_image}
                            alt={related.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                          {related.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2">
                          {related.reading_time} min read
                        </p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>

      <Footer />
    </>
  );
}