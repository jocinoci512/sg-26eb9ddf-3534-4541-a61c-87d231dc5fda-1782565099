/* eslint-disable @typescript-eslint/no-empty-object-type */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_daily: {
        Row: {
          avg_pages_per_session: number | null
          avg_session_duration_minutes: number | null
          bounce_rate: number | null
          created_at: string | null
          date: string
          device_breakdown: Json | null
          id: string
          new_users: number | null
          returning_users: number | null
          top_pages: Json | null
          total_page_views: number | null
          total_sessions: number | null
          traffic_sources: Json | null
          unique_visitors: number | null
          updated_at: string | null
        }
        Insert: {
          avg_pages_per_session?: number | null
          avg_session_duration_minutes?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          date: string
          device_breakdown?: Json | null
          id?: string
          new_users?: number | null
          returning_users?: number | null
          top_pages?: Json | null
          total_page_views?: number | null
          total_sessions?: number | null
          traffic_sources?: Json | null
          unique_visitors?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_pages_per_session?: number | null
          avg_session_duration_minutes?: number | null
          bounce_rate?: number | null
          created_at?: string | null
          date?: string
          device_breakdown?: Json | null
          id?: string
          new_users?: number | null
          returning_users?: number | null
          top_pages?: Json | null
          total_page_views?: number | null
          total_sessions?: number | null
          traffic_sources?: Json | null
          unique_visitors?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      carriers: {
        Row: {
          created_at: string | null
          dot_number: string | null
          email: string | null
          id: string
          is_active: boolean | null
          mc_number: string | null
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          dot_number?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          mc_number?: string | null
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          dot_number?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          mc_number?: string | null
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string | null
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          state: string | null
          updated_at: string | null
          user_id: string | null
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string | null
          document_type: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          shipment_id: string | null
        }
        Insert: {
          created_at?: string | null
          document_type?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          shipment_id?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          shipment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          carrier_id: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          is_active: boolean | null
          license_number: string | null
          phone: string | null
          truck_number: string | null
        }
        Insert: {
          carrier_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          phone?: string | null
          truck_number?: string | null
        }
        Update: {
          carrier_id?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          phone?: string | null
          truck_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drivers_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          provider: string | null
          recipient_email: string
          resend_email_id: string | null
          retry_count: number | null
          sent_at: string | null
          shipment_id: string | null
          status: string
          subject: string
          template_key: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          recipient_email: string
          resend_email_id?: string | null
          retry_count?: number | null
          sent_at?: string | null
          shipment_id?: string | null
          status?: string
          subject: string
          template_key?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          recipient_email?: string
          resend_email_id?: string | null
          retry_count?: number | null
          sent_at?: string | null
          shipment_id?: string | null
          status?: string
          subject?: string
          template_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      email_settings: {
        Row: {
          api_key_encrypted: string | null
          created_at: string | null
          from_email: string
          from_name: string
          id: string
          is_active: boolean | null
          provider: string
          updated_at: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          created_at?: string | null
          from_email?: string
          from_name?: string
          id?: string
          is_active?: boolean | null
          provider?: string
          updated_at?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          created_at?: string | null
          from_email?: string
          from_name?: string
          id?: string
          is_active?: boolean | null
          provider?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          body_text: string
          created_at: string
          id: string
          is_active: boolean | null
          subject: string
          template_key: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body_html: string
          body_text: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          subject: string
          template_key: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body_html?: string
          body_text?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          subject?: string
          template_key?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string | null
          id: string
          is_published: boolean | null
          order_index: number | null
          question: string
        }
        Insert: {
          answer: string
          category: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          question: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          question?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          customer_id: string | null
          id: string
          is_read: boolean | null
          message: string
          shipment_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          shipment_id?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          shipment_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string | null
          customer_id: string | null
          device_type: string | null
          duration_seconds: number | null
          id: string
          ip_address: string | null
          os: string | null
          page_path: string
          page_title: string | null
          referrer: string | null
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string | null
          customer_id?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: string | null
          os?: string | null
          page_path: string
          page_title?: string | null
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string | null
          customer_id?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: string | null
          os?: string | null
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_views_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          created_at: string | null
          file_url: string
          id: string
          photo_type: string | null
          shipment_id: string | null
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          file_url: string
          id?: string
          photo_type?: string | null
          shipment_id?: string | null
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          file_url?: string
          id?: string
          photo_type?: string | null
          shipment_id?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          delivery_address: string
          delivery_city: string
          delivery_state: string
          delivery_zip: string
          estimated_cost: number | null
          id: string
          notes: string | null
          pickup_address: string
          pickup_city: string
          pickup_state: string
          pickup_zip: string
          preferred_pickup_date: string | null
          quote_number: string
          shipping_type: string | null
          status: string | null
          updated_at: string | null
          vehicle_make: string
          vehicle_model: string
          vehicle_type: string | null
          vehicle_year: number
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          delivery_address: string
          delivery_city: string
          delivery_state: string
          delivery_zip: string
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          pickup_address: string
          pickup_city: string
          pickup_state: string
          pickup_zip: string
          preferred_pickup_date?: string | null
          quote_number: string
          shipping_type?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_make: string
          vehicle_model: string
          vehicle_type?: string | null
          vehicle_year: number
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          delivery_address?: string
          delivery_city?: string
          delivery_state?: string
          delivery_zip?: string
          estimated_cost?: number | null
          id?: string
          notes?: string | null
          pickup_address?: string
          pickup_city?: string
          pickup_state?: string
          pickup_zip?: string
          preferred_pickup_date?: string | null
          quote_number?: string
          shipping_type?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_make?: string
          vehicle_model?: string
          vehicle_type?: string | null
          vehicle_year?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotes_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      shipment_events: {
        Row: {
          created_at: string
          event_description: string
          event_type: string
          id: string
          ip_address: string | null
          new_value: string | null
          old_value: string | null
          performed_by: string | null
          performed_by_name: string | null
          performed_by_role: string | null
          shipment_id: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          event_description: string
          event_type: string
          id?: string
          ip_address?: string | null
          new_value?: string | null
          old_value?: string | null
          performed_by?: string | null
          performed_by_name?: string | null
          performed_by_role?: string | null
          shipment_id: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          event_description?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          new_value?: string | null
          old_value?: string | null
          performed_by?: string | null
          performed_by_name?: string | null
          performed_by_role?: string | null
          shipment_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipment_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_delivery_date: string | null
          carrier_id: string | null
          created_at: string | null
          customer_id: string | null
          damage_inspection: string | null
          delay_duration_hours: number | null
          delay_reason: string | null
          delivery_address_line1: string
          delivery_address_line2: string | null
          delivery_city: string
          delivery_country: string | null
          delivery_state: string
          delivery_zip_code: string
          driver_id: string | null
          estimated_delivery_date: string | null
          id: string
          internal_notes: string | null
          is_delayed: boolean | null
          notes: string | null
          paid_amount: number | null
          payment_status: string | null
          pickup_address_line1: string
          pickup_address_line2: string | null
          pickup_city: string
          pickup_country: string | null
          pickup_date: string | null
          pickup_state: string
          pickup_zip_code: string
          priority: string | null
          receiver_email: string | null
          receiver_name: string
          receiver_phone: string | null
          sender_email: string | null
          sender_name: string
          sender_phone: string | null
          shipment_type: string | null
          shipping_cost: number | null
          status: string | null
          tracking_number: string
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          carrier_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          damage_inspection?: string | null
          delay_duration_hours?: number | null
          delay_reason?: string | null
          delivery_address_line1: string
          delivery_address_line2?: string | null
          delivery_city: string
          delivery_country?: string | null
          delivery_state: string
          delivery_zip_code: string
          driver_id?: string | null
          estimated_delivery_date?: string | null
          id?: string
          internal_notes?: string | null
          is_delayed?: boolean | null
          notes?: string | null
          paid_amount?: number | null
          payment_status?: string | null
          pickup_address_line1: string
          pickup_address_line2?: string | null
          pickup_city: string
          pickup_country?: string | null
          pickup_date?: string | null
          pickup_state: string
          pickup_zip_code: string
          priority?: string | null
          receiver_email?: string | null
          receiver_name: string
          receiver_phone?: string | null
          sender_email?: string | null
          sender_name: string
          sender_phone?: string | null
          shipment_type?: string | null
          shipping_cost?: number | null
          status?: string | null
          tracking_number: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          carrier_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          damage_inspection?: string | null
          delay_duration_hours?: number | null
          delay_reason?: string | null
          delivery_address_line1?: string
          delivery_address_line2?: string | null
          delivery_city?: string
          delivery_country?: string | null
          delivery_state?: string
          delivery_zip_code?: string
          driver_id?: string | null
          estimated_delivery_date?: string | null
          id?: string
          internal_notes?: string | null
          is_delayed?: boolean | null
          notes?: string | null
          paid_amount?: number | null
          payment_status?: string | null
          pickup_address_line1?: string
          pickup_address_line2?: string | null
          pickup_city?: string
          pickup_country?: string | null
          pickup_date?: string | null
          pickup_state?: string
          pickup_zip_code?: string
          priority?: string | null
          receiver_email?: string | null
          receiver_name?: string
          receiver_phone?: string | null
          sender_email?: string | null
          sender_name?: string
          sender_phone?: string | null
          shipment_type?: string | null
          shipping_cost?: number | null
          status?: string | null
          tracking_number?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          content: string
          created_at: string | null
          customer_company: string | null
          customer_name: string
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          rating: number | null
        }
        Insert: {
          content: string
          created_at?: string | null
          customer_company?: string | null
          customer_name: string
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          rating?: number | null
        }
        Update: {
          content?: string
          created_at?: string | null
          customer_company?: string | null
          customer_name?: string
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          rating?: number | null
        }
        Relationships: []
      }
      tracking_updates: {
        Row: {
          created_at: string | null
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          notes: string | null
          shipment_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notes?: string | null
          shipment_id: string
          status: string
        }
        Update: {
          created_at?: string | null
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notes?: string | null
          shipment_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_updates_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          browser: string | null
          country: string | null
          created_at: string | null
          customer_id: string | null
          device_type: string | null
          duration_minutes: number | null
          ended_at: string | null
          id: string
          is_returning_user: boolean | null
          os: string | null
          pages_visited: number | null
          referrer: string | null
          session_id: string
          started_at: string | null
          updated_at: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          browser?: string | null
          country?: string | null
          created_at?: string | null
          customer_id?: string | null
          device_type?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          is_returning_user?: boolean | null
          os?: string | null
          pages_visited?: number | null
          referrer?: string | null
          session_id: string
          started_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          browser?: string | null
          country?: string | null
          created_at?: string | null
          customer_id?: string | null
          device_type?: string | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          is_returning_user?: boolean | null
          os?: string | null
          pages_visited?: number | null
          referrer?: string | null
          session_id?: string
          started_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          dashboard_notifications_enabled: boolean | null
          dashboard_quote_updates: boolean | null
          dashboard_shipment_updates: boolean | null
          dashboard_system_alerts: boolean | null
          email_notifications_enabled: boolean | null
          email_quote_updates: boolean | null
          email_shipment_created: boolean | null
          email_shipment_delayed: boolean | null
          email_shipment_delivered: boolean | null
          email_shipment_in_transit: boolean | null
          email_shipment_picked_up: boolean | null
          id: string
          notification_frequency: string | null
          push_notifications_enabled: boolean | null
          sms_notifications_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dashboard_notifications_enabled?: boolean | null
          dashboard_quote_updates?: boolean | null
          dashboard_shipment_updates?: boolean | null
          dashboard_system_alerts?: boolean | null
          email_notifications_enabled?: boolean | null
          email_quote_updates?: boolean | null
          email_shipment_created?: boolean | null
          email_shipment_delayed?: boolean | null
          email_shipment_delivered?: boolean | null
          email_shipment_in_transit?: boolean | null
          email_shipment_picked_up?: boolean | null
          id?: string
          notification_frequency?: string | null
          push_notifications_enabled?: boolean | null
          sms_notifications_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          dashboard_notifications_enabled?: boolean | null
          dashboard_quote_updates?: boolean | null
          dashboard_shipment_updates?: boolean | null
          dashboard_system_alerts?: boolean | null
          email_notifications_enabled?: boolean | null
          email_quote_updates?: boolean | null
          email_shipment_created?: boolean | null
          email_shipment_delayed?: boolean | null
          email_shipment_delivered?: boolean | null
          email_shipment_in_transit?: boolean | null
          email_shipment_picked_up?: boolean | null
          id?: string
          notification_frequency?: string | null
          push_notifications_enabled?: boolean | null
          sms_notifications_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_running: boolean | null
          license_plate: string | null
          make: string
          mileage: number | null
          model: string
          vehicle_type: string | null
          vin: string | null
          year: number
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_running?: boolean | null
          license_plate?: string | null
          make: string
          mileage?: number | null
          model: string
          vehicle_type?: string | null
          vin?: string | null
          year: number
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_running?: boolean | null
          license_plate?: string | null
          make?: string
          mileage?: number | null
          model?: string
          vehicle_type?: string | null
          vin?: string | null
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_quote_number: { Args: never; Returns: string }
      generate_tracking_number: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
