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
   * Fetches all surveys from the database.
   * @returns Promise that resolves to an array of Survey objects
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
   * Fetches a single survey by its ID.
   * @param id The survey ID to look for
   * @returns Promise that resolves to a Survey object or null if not found
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
   * Fetches all questions for a specific survey.
   * @param id The survey ID
   * @returns Promise that resolves to an array of Question objects or null
   */
  async getQuestionsBySurveyId(id: number): Promise<Question[] | null> {
    const { data, error } = await this.supabase
      .from('questions')
      .select('*')
      .eq('survey_id', id);

    if (error || !data) {

      return null;
    }
    return data.sort((a, b) => a.order - b.order) as Question[];
  }

  /**
   * Fetches all answers for a specific question.
   * @param id The question ID
   * @returns Promise that resolves to an array of Answer objects or null
   */
  async getAnswersByQuestionId(id: string): Promise<Answer[] | null> {
    const { data, error } = await this.supabase
      .from('answers')
      .select('*')
      .eq('question_id', id);
    if (error || !data) {
      return null;
    }
    return data.sort((a, b) => a.letter.localeCompare(b.letter)) as Answer[];
  }

  /**
   * Gets the number of votes for a specific answer.
   * @param id The answer ID
   * @returns Promise that resolves to the vote count or null
   */
  async getVotesByAnswerId(id: string): Promise<number | null> {
    const { data, error } = await this.supabase
      .from('votes')
      .select('*')
      .eq('answer_id', id);
    if (error || !data) {
      return null;
    }
    return data.length;
  }


  /**
   * Subscribes to real-time survey changes.
   * @param onChange Callback function to execute when surveys change
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
   * Stops listening to survey changes.
   */
  stopSurveySubscription(): void {
    if (!this.channels) return;
    this.supabase.removeChannel(this.channels);
    this.channels = undefined;
  }


  /**
   * Creates a new survey in the database.
   * @param survey The survey data to insert
   * @returns Promise that resolves to the created survey data
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
   * Creates a new question in the database.
   * @param question The question data to insert
   * @returns Promise that resolves to the created question data
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
   * Creates a new answer in the database.
   * @param answer The answer data to insert
   * @returns Promise that resolves to the created answer data
   */
  async setAnswers(answer: Omit<Answer, 'id' | 'votes'>) {
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
   * Saves votes for a survey response.
   * @param surveyId The survey ID
   * @param selectedVotes Array of question and answer selections
   */
  async setVotes(surveyId: number, selectedVotes: { questionId: string; answerIds: string[] }[]): Promise<void> {
    const rows = selectedVotes.flatMap(v =>
      v.answerIds.map(answerId => ({
        answer_id: answerId,
        question_id: v.questionId,
        survey_id: surveyId
      }))
    );

    const { error } = await this.supabase
      .from('votes')
      .insert(rows)
      .select();

    if (error) console.error(error);
  }


  ngOnDestroy() {
    this.stopSurveySubscription();
  }
}
