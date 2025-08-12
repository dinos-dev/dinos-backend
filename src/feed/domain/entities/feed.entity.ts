import { Section } from '../value-object/section.vo';

/**
 * Feed의 MongoDB Schema를 확장해서 사용하기 위한 Entity
 */
export class Feed {
  constructor(
    private readonly id: string,
    private readonly inputKeyword: string,
    private readonly persona: string,
    private readonly character: string,
    private readonly title: string,
    private readonly intro: string,
    private readonly sections: Section[],
    private readonly createdAt: Date,
  ) {}

  getId(): string {
    return this.id;
  }

  getInputKeyword(): string {
    return this.inputKeyword;
  }

  getPersona(): string {
    return this.persona;
  }

  getCharacter(): string {
    return this.character;
  }

  getTitle(): string {
    return this.title;
  }

  getIntro(): string {
    return this.intro;
  }

  getSections(): Section[] {
    return this.sections;
  }
}
