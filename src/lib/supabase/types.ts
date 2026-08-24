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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      badge_awards: {
        Row: {
          awarded_at: string
          badge_id: string
          family_id: string
          id: string
          student_id: string
        }
        Insert: {
          awarded_at?: string
          badge_id: string
          family_id: string
          id?: string
          student_id: string
        }
        Update: {
          awarded_at?: string
          badge_id?: string
          family_id?: string
          id?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badge_awards_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_awards_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_awards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          created_at: string
          criteria: Json
          description: string | null
          family_id: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          criteria?: Json
          description?: string | null
          family_id?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string | null
          family_id?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      book_progress: {
        Row: {
          admin_override_comment: string | null
          admin_override_score: number | null
          ai_evaluation: Json | null
          book_id: string
          created_at: string
          family_id: string
          finished_at: string | null
          id: string
          pages_read: number
          review_text: string | null
          reviewed_by: string | null
          status: string
          student_id: string
        }
        Insert: {
          admin_override_comment?: string | null
          admin_override_score?: number | null
          ai_evaluation?: Json | null
          book_id: string
          created_at?: string
          family_id: string
          finished_at?: string | null
          id?: string
          pages_read?: number
          review_text?: string | null
          reviewed_by?: string | null
          status?: string
          student_id: string
        }
        Update: {
          admin_override_comment?: string | null
          admin_override_score?: number | null
          ai_evaluation?: Json | null
          book_id?: string
          created_at?: string
          family_id?: string
          finished_at?: string | null
          id?: string
          pages_read?: number
          review_text?: string | null
          reviewed_by?: string | null
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "book_progress_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_progress_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_progress_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          active: boolean
          author: string | null
          category_id: string | null
          created_at: string
          family_id: string
          genres: string[]
          id: string
          language: string
          points_base: number
          synopsis: string | null
          title: string
          total_pages: number | null
        }
        Insert: {
          active?: boolean
          author?: string | null
          category_id?: string | null
          created_at?: string
          family_id: string
          genres?: string[]
          id?: string
          language?: string
          points_base?: number
          synopsis?: string | null
          title: string
          total_pages?: number | null
        }
        Update: {
          active?: boolean
          author?: string | null
          category_id?: string | null
          created_at?: string
          family_id?: string
          genres?: string[]
          id?: string
          language?: string
          points_base?: number
          synopsis?: string | null
          title?: string
          total_pages?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "books_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "books_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          active: boolean
          color: string
          created_at: string
          display_order: number
          family_id: string
          icon: string | null
          id: string
          name: string
          slug: string
          supports_tracks: boolean
          type: string
        }
        Insert: {
          active?: boolean
          color: string
          created_at?: string
          display_order?: number
          family_id: string
          icon?: string | null
          id?: string
          name: string
          slug: string
          supports_tracks?: boolean
          type: string
        }
        Update: {
          active?: boolean
          color?: string
          created_at?: string
          display_order?: number
          family_id?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          supports_tracks?: boolean
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      content_pieces: {
        Row: {
          created_at: string
          engagement_snapshot: Json
          family_id: string
          id: string
          points_awarded: number
          published_at: string | null
          student_id: string
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          engagement_snapshot?: Json
          family_id: string
          id?: string
          points_awarded?: number
          published_at?: string | null
          student_id: string
          title: string
          type: string
        }
        Update: {
          created_at?: string
          engagement_snapshot?: Json
          family_id?: string
          id?: string
          points_awarded?: number
          published_at?: string | null
          student_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_pieces_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_pieces_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          id: string
          name: string
          plan: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          plan?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          plan?: string
        }
        Relationships: []
      }
      feedback_suggestions: {
        Row: {
          admin_response: string | null
          created_at: string
          family_id: string
          id: string
          message: string
          status: string
          student_id: string
        }
        Insert: {
          admin_response?: string | null
          created_at?: string
          family_id: string
          id?: string
          message: string
          status?: string
          student_id: string
        }
        Update: {
          admin_response?: string | null
          created_at?: string
          family_id?: string
          id?: string
          message?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_suggestions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_suggestions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboard_entries: {
        Row: {
          computed_at: string
          display_name: string
          family_id: string
          id: string
          is_fictional: boolean
          period: string
          points_total: number
          student_id: string | null
        }
        Insert: {
          computed_at?: string
          display_name: string
          family_id: string
          id?: string
          is_fictional?: boolean
          period: string
          points_total?: number
          student_id?: string | null
        }
        Update: {
          computed_at?: string
          display_name?: string
          family_id?: string
          id?: string
          is_fictional?: boolean
          period?: string
          points_total?: number
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboard_entries_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboard_entries_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          family_id: string
          id: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          family_id: string
          id?: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          family_id?: string
          id?: string
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      points_ledger: {
        Row: {
          created_at: string
          family_id: string
          id: string
          points: number
          reason: string | null
          source_id: string | null
          source_type: string
          student_id: string
        }
        Insert: {
          created_at?: string
          family_id: string
          id?: string
          points: number
          reason?: string | null
          source_id?: string | null
          source_type: string
          student_id: string
        }
        Update: {
          created_at?: string
          family_id?: string
          id?: string
          points?: number
          reason?: string | null
          source_id?: string | null
          source_type?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_ledger_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_ledger_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      story_bible: {
        Row: {
          capitulos: Json
          family_id: string
          genero: string | null
          id: string
          mundo: Json
          personajes_secundarios: Json
          protagonista: Json
          student_id: string
          timeline: Json
          titulo_historia: string | null
          updated_at: string
        }
        Insert: {
          capitulos?: Json
          family_id: string
          genero?: string | null
          id?: string
          mundo?: Json
          personajes_secundarios?: Json
          protagonista?: Json
          student_id: string
          timeline?: Json
          titulo_historia?: string | null
          updated_at?: string
        }
        Update: {
          capitulos?: Json
          family_id?: string
          genero?: string | null
          id?: string
          mundo?: Json
          personajes_secundarios?: Json
          protagonista?: Json
          student_id?: string
          timeline?: Json
          titulo_historia?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_bible_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_bible_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      student_module_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          family_id: string
          id: string
          module_id: string
          points_awarded: number | null
          status: string
          student_id: string
          submission_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          family_id: string
          id?: string
          module_id: string
          points_awarded?: number | null
          status?: string
          student_id: string
          submission_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          family_id?: string
          id?: string
          module_id?: string
          points_awarded?: number | null
          status?: string
          student_id?: string
          submission_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_module_progress_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "subject_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_module_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_module_progress_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_tracks: {
        Row: {
          assigned_by: string | null
          category_id: string
          ended_at: string | null
          family_id: string
          id: string
          started_at: string
          student_id: string
          track_id: string
        }
        Insert: {
          assigned_by?: string | null
          category_id: string
          ended_at?: string | null
          family_id: string
          id?: string
          started_at?: string
          student_id: string
          track_id: string
        }
        Update: {
          assigned_by?: string | null
          category_id?: string
          ended_at?: string | null
          family_id?: string
          id?: string
          started_at?: string
          student_id?: string
          track_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_tracks_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_tracks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_tracks_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_tracks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_tracks_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_modules: {
        Row: {
          active: boolean
          category_id: string
          content: Json
          created_at: string
          description: string | null
          family_id: string
          id: string
          order_index: number
          points: number
          stage: string | null
          title: string
        }
        Insert: {
          active?: boolean
          category_id: string
          content?: Json
          created_at?: string
          description?: string | null
          family_id: string
          id?: string
          order_index?: number
          points?: number
          stage?: string | null
          title: string
        }
        Update: {
          active?: boolean
          category_id?: string
          content?: Json
          created_at?: string
          description?: string | null
          family_id?: string
          id?: string
          order_index?: number
          points?: number
          stage?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_modules_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_modules_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          admin_override_comment: string | null
          admin_override_score: number | null
          ai_evaluated_at: string | null
          ai_evaluation: Json | null
          created_at: string
          family_id: string
          file_url: string | null
          id: string
          metadata: Json
          reviewed_by: string | null
          student_id: string
          task_instance_id: string | null
          text_content: string | null
          type: string
        }
        Insert: {
          admin_override_comment?: string | null
          admin_override_score?: number | null
          ai_evaluated_at?: string | null
          ai_evaluation?: Json | null
          created_at?: string
          family_id: string
          file_url?: string | null
          id?: string
          metadata?: Json
          reviewed_by?: string | null
          student_id: string
          task_instance_id?: string | null
          text_content?: string | null
          type: string
        }
        Update: {
          admin_override_comment?: string | null
          admin_override_score?: number | null
          ai_evaluated_at?: string | null
          ai_evaluation?: Json | null
          created_at?: string
          family_id?: string
          file_url?: string | null
          id?: string
          metadata?: Json
          reviewed_by?: string | null
          student_id?: string
          task_instance_id?: string | null
          text_content?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_task_instance_id_fkey"
            columns: ["task_instance_id"]
            isOneToOne: false
            referencedRelation: "task_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      task_checklist_items: {
        Row: {
          active: boolean
          created_at: string
          duration_minutes: number
          family_id: string
          id: string
          label: string
          order_index: number
          points: number
          recurrence_days: number[] | null
          task_template_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          duration_minutes?: number
          family_id: string
          id?: string
          label: string
          order_index?: number
          points?: number
          recurrence_days?: number[] | null
          task_template_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          duration_minutes?: number
          family_id?: string
          id?: string
          label?: string
          order_index?: number
          points?: number
          recurrence_days?: number[] | null
          task_template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_checklist_items_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_checklist_items_task_template_id_fkey"
            columns: ["task_template_id"]
            isOneToOne: false
            referencedRelation: "task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      task_instances: {
        Row: {
          completed_at: string | null
          created_at: string
          family_id: string
          id: string
          penalty_applied: boolean
          points_awarded: number | null
          rescheduled_from_id: string | null
          scheduled_date: string
          status: string
          student_id: string
          template_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          family_id: string
          id?: string
          penalty_applied?: boolean
          points_awarded?: number | null
          rescheduled_from_id?: string | null
          scheduled_date: string
          status?: string
          student_id: string
          template_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          family_id?: string
          id?: string
          penalty_applied?: boolean
          points_awarded?: number | null
          rescheduled_from_id?: string | null
          scheduled_date?: string
          status?: string
          student_id?: string
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_instances_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_instances_rescheduled_from_id_fkey"
            columns: ["rescheduled_from_id"]
            isOneToOne: false
            referencedRelation: "task_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_instances_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "task_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          active: boolean
          category_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          family_id: string
          focus_batch_required: boolean
          id: string
          points_base: number
          recurrence: string
          recurrence_days: number[] | null
          title: string
          track_id: string | null
        }
        Insert: {
          active?: boolean
          category_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          family_id: string
          focus_batch_required?: boolean
          id?: string
          points_base?: number
          recurrence: string
          recurrence_days?: number[] | null
          title: string
          track_id?: string | null
        }
        Update: {
          active?: boolean
          category_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          family_id?: string
          focus_batch_required?: boolean
          id?: string
          points_base?: number
          recurrence?: string
          recurrence_days?: number[] | null
          title?: string
          track_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_templates_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_templates_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          active: boolean
          category_id: string
          created_at: string
          description: string | null
          display_order: number
          family_id: string
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          active?: boolean
          category_id: string
          created_at?: string
          description?: string | null
          display_order?: number
          family_id: string
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          active?: boolean
          category_id?: string
          created_at?: string
          description?: string | null
          display_order?: number
          family_id?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracks_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracks_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_weekly_reports: {
        Row: {
          created_at: string
          equity_change_pct: number
          family_id: string
          id: string
          num_positions: number
          points_awarded: number
          screenshot_url: string | null
          student_id: string
          validated_by_admin_at: string | null
          week_start: string
        }
        Insert: {
          created_at?: string
          equity_change_pct?: number
          family_id: string
          id?: string
          num_positions?: number
          points_awarded?: number
          screenshot_url?: string | null
          student_id: string
          validated_by_admin_at?: string | null
          week_start: string
        }
        Update: {
          created_at?: string
          equity_change_pct?: number
          family_id?: string
          id?: string
          num_positions?: number
          points_awarded?: number
          screenshot_url?: string | null
          student_id?: string
          validated_by_admin_at?: string | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_weekly_reports_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trading_weekly_reports_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      typing_sessions: {
        Row: {
          accuracy_pct: number
          created_at: string
          dictation_text: string
          duration_seconds: number
          errors: Json
          family_id: string
          id: string
          points_awarded: number
          student_id: string
          typed_text: string
          wpm: number
        }
        Insert: {
          accuracy_pct: number
          created_at?: string
          dictation_text: string
          duration_seconds: number
          errors?: Json
          family_id: string
          id?: string
          points_awarded?: number
          student_id: string
          typed_text: string
          wpm: number
        }
        Update: {
          accuracy_pct?: number
          created_at?: string
          dictation_text?: string
          duration_seconds?: number
          errors?: Json
          family_id?: string
          id?: string
          points_awarded?: number
          student_id?: string
          typed_text?: string
          wpm?: number
        }
        Relationships: [
          {
            foreignKeyName: "typing_sessions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "typing_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          birth_year: number | null
          created_at: string
          display_name: string
          email: string
          family_id: string
          id: string
          is_fictional: boolean
          role: string
        }
        Insert: {
          avatar_url?: string | null
          birth_year?: number | null
          created_at?: string
          display_name: string
          email: string
          family_id: string
          id: string
          is_fictional?: boolean
          role: string
        }
        Update: {
          avatar_url?: string | null
          birth_year?: number | null
          created_at?: string
          display_name?: string
          email?: string
          family_id?: string
          id?: string
          is_fictional?: boolean
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_family_id: { Args: never; Returns: string }
      is_parent_admin: { Args: never; Returns: boolean }
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
