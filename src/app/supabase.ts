import { Injectable } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { Survey } from './core/interfaces/survey.interfaces';
import { Question } from './core/interfaces/survey.interfaces';
import { Answer } from './core/interfaces/survey.interfaces';


@Injectable({
  providedIn: 'root',
})

export class Supabase {
  supabaseUrl = 'https://vuomfyxlslukalfxolae.supabase.co';
  supabaseKey = 'sb_publishable_T7K1V-wELpB7XeKpPC0WrQ_BTiPBQVi';
  supabase = createClient(this.supabaseUrl, this.supabaseKey);
  channels: RealtimeChannel | undefined;

  /**
   * Loads all surveys from Supabase.
   * We also convert the end_date string into a Date object
   * so existing date helper functions can work directly.
   */
  async getSurveyData(): Promise<Survey[]> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*')
      .order('end_date', { ascending: true, nullsFirst: false });

    if (error) {
      console.error(error);
      return [];
    }

    return (data ?? []).map((survey) => ({
      ...survey,
      end_date: survey.end_date ? new Date(survey.end_date) : null,
    })) as Survey[];
  }

  /**
   * Loads one survey by id for the detail page.
   * Returns null when nothing is found or when an error happens.
   */
  async getSurveyById(id: string): Promise<Survey | null> {
    const { data, error } = await this.supabase
      .from('surveys')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      if (error) console.error(error);
      return null;
    }

    return {
      ...data,
      end_date: data.end_date ? new Date(data.end_date) : null,
    } as Survey;
  }

  /**
   * Starts a realtime listener on the surveys table.
   * Whenever data changes, the given callback is called.
   */
  subscribeSurveyChanges(onChange: () => void): void {
    this.stopSurveySubscription();

    this.channels = this.supabase
      .channel('surveys-live-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'surveys' },
        () => {
          onChange();
        },
      )
      .subscribe();
  }

  /**
   * Stops the current survey realtime channel.
   * We call this when leaving the page to avoid duplicate listeners.
   */
  stopSurveySubscription(): void {
    if (!this.channels) return;
    this.supabase.removeChannel(this.channels);
    this.channels = undefined;
  }

  /**
   * Inserts one survey row into the surveys table.
   * Returns the inserted survey from Supabase.
   */
  async setSurvey(survey: Omit<Survey, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('surveys')
      .insert([
        survey
      ])
      .select()
      .single();
    if (error) console.error(error);
    return data;
  }

  /**
   * Inserts one question row for a survey.
   * Returns the inserted question data.
   */
  async setQuestions(question: Omit<Question, 'id' | 'answers'>) {
    const { data, error } = await this.supabase
      .from('questions')
      .insert([
        question
      ])
      .select()
      .single();
    if (error) console.error(error);
    return data;
  }

  /**
   * Inserts one answer row for a question.
   * Returns the inserted answer data.
   */
  async setAnswers(answer: Omit<Answer, 'votes'>) {
    const { data, error } = await this.supabase
      .from('answers')
      .insert([
        answer
      ])
      .select();
    if (error) console.error(error);
    return data;
  }

  /**
   * Angular lifecycle hook.
   * Makes sure an open realtime subscription is cleaned up.
   */
  ngOnDestroy() {
    this.stopSurveySubscription();
  }
}
