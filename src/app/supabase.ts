import { Injectable } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { Survey } from './core/interfaces/survey.interfaces';
import { Question } from './core/interfaces/survey.interfaces';
import { Answer } from './core/interfaces/survey.interfaces';


@Injectable({
  providedIn: 'root',
})

export class Supabase {
  supabaseUrl = 'https://vuomfyxlslukalfxolae.supabase.co'
  supabaseKey = 'sb_publishable_T7K1V-wELpB7XeKpPC0WrQ_BTiPBQVi'
  supabase = createClient(this.supabaseUrl, this.supabaseKey)
  channels: RealtimeChannel | undefined;

  async getSurveyData() {
    let data = await this.supabase
      .from('surveys')
    this.channels = this.supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'surveys' },
        (payload) => {
          console.log('Change received!', payload)
        }
      )
      .subscribe()
  }

  async setSurvey(survey: Omit<Survey, 'id' | 'created_at'>) {
    const { data, error } = await this.supabase
      .from('surveys')
      .insert([
        survey
      ])
      .select()
      .single();
      return data;
  }

  async setQuestions(question: Omit<Question, 'id' | 'answers'>) {
    const { data, error } = await this.supabase
      .from('questions')
      .insert([
        question
      ])
      .select()
      .single();
        if (error) console.error(error);
        return data
  }

  async setAnswers(answer: Omit<Answer, 'votes'>) {
    const { data, error } = await this.supabase
      .from('answers')
      .insert([
        answer
      ])
      .select()
  }

  ngOnDestroy() {
    if (this.channels) this.supabase.removeAllChannels()
  }
}
