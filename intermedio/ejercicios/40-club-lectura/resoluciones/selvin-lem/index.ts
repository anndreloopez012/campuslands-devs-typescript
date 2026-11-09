export {};

interface Member {
    name: string;
    pagesRead: number;
    favoriteGenre: string;
}

interface BookMeeting {
    date: string;
    book: string;
    pages: number;
}

class ReadingClub<T extends Member> {
    constructor(
        private readonly members: T[],
        private readonly meeting: BookMeeting,
    ) {}

    getProgress(): void {
        console.log(`${this.meeting.book}: ${this.meeting.pages} paginas`);
        this.members.forEach((member) => {
            const percent = Math.min(100, (member.pagesRead / this.meeting.pages) * 100);
            console.log(`${member.name}: ${percent.toFixed(0)}% leido (${member.favoriteGenre})`);
        });
    }
}

const members: Member[] = [
    { name: "Eva", pagesRead: 180, favoriteGenre: "misterio" },
    { name: "Pablo", pagesRead: 240, favoriteGenre: "fantasia" },
    { name: "Lina", pagesRead: 300, favoriteGenre: "ciencia ficcion" },
];

new ReadingClub(members, { date: "2026-06-15", book: "La ciudad sumergida", pages: 300 })
    .getProgress();
