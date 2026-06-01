import { Component, input, output, computed } from '@angular/core';
import { Question } from '../../../../core/interfaces/survey.interfaces';
import { QuestionValidationResult } from '../../../../core/interfaces/survey.interfaces';

@Component({
  selector: 'app-question-block',
  imports: [],
  templateUrl: './question-block.html',
  styleUrl: './question-block.scss',
})
export class QuestionBlock {
  questionNumber = input(1);
  question = input.required<Question>();
  questionChange = output<Question>();
  deleteQuestion = output<void>();
  validationChange = output<QuestionValidationResult>();
  isValid = computed(() => this.checkQuestionValidity() && this.checkAnswerValidity());

  /**
   * Emits question change events.
   * @param updated The updated question data
   */
  private emit(updated: Question): void {
    this.questionChange.emit(updated);
    this.validationChange.emit({
      isValid: this.isValid(),
      question: updated
    });
  }

  /**
   * Validates that all answers have text.
   * @returns True if all answers are valid
   */
  checkAnswerValidity() {
    return this.question().answers.every((a) => a.text.trim().length > 0);
  }

  /**
   * Validates that the question text is valid.
   * @returns True if question is valid
   */
  checkQuestionValidity() {
    return this.question().text.trim().length >= 4 && this.question().text.trim().endsWith('?');
  }

  /**
   * Updates the question text.
   * @param text The new question text
   */
  updateQuestionText(text: string): void {
    this.emit({ ...this.question(), text });
  }

  /**
   * Deletes or clears the question.
   */
  onDeleteQuestion(): void {
    if (this.questionNumber() == 1) {
      this.question().text = "";
    } else {
      this.deleteQuestion.emit();
    }
  }

  /**
   * Updates the text of an answer.
   * @param index The answer index
   * @param text The new answer text
   */
  updateAnswerText(index: number, text: string): void {
    const q = this.question();
    this.emit({
      ...q,
      answers: q.answers.map((a, i) => (i === index ? { ...a, text } : a)),
    });
  }

  /**
   * Adds a new answer option to the question.
   */
  addAnswer(): void {
    if (this.question().answers.length >= 6) return;
    const q = this.question();
    const nextLetter = String.fromCharCode(65 + q.answers.length);
    this.emit({
      ...q,
      answers: [
        ...q.answers,
        { id: '', question_id: '', letter: nextLetter, text: '', votes: 0 },
      ],
    });
  }

  /**
   * Removes an answer option from the question.
   * @param index The answer index to remove
   */
  removeAnswer(index: number): void {
    const q = this.question();

    if (q.answers.length <= 2) {
      this.emit({
        ...q,
        answers: q.answers.map((a, i) =>
          i === index ? { ...a, text: '' } : a
        ),
      }); return;
    }
    this.emit({
      ...q,
      answers: q.answers
        .filter((_, i) => i !== index)
        .map((a, i) => ({ ...a, letter: String.fromCharCode(65 + i) })),
    });
  }

  /**
   * Toggles whether multiple answers can be selected.
   * @param checked True to allow multiple answers
   */
  toggleMultiple(checked: boolean): void {
    this.emit({ ...this.question(), allow_multiple_answers: checked });
  }
}
