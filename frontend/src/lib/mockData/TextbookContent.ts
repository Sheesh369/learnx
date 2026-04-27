export const CHAPTER_TEXTBOOK_CONTENT: Record<string, { sections: { heading: string; paragraphs: string[]; highlight?: string; formula?: string }[] }> = {
  science: { sections: [
    { heading: '1.1 The Cell Theory', paragraphs: [
      'All living organisms are composed of cells. The **cell** is the basic structural and functional unit of life. Cells were first observed by Robert Hooke in 1665 when he examined a thin slice of cork under a microscope.',
      'The cell theory states three fundamental principles:',
    ]},
    { heading: '1.2 Structure of the Cell', highlight: 'Cell Membrane', paragraphs: [
      'Every cell is enclosed by a thin membrane called the **plasma membrane** or **cell membrane**. This membrane is selectively permeable, meaning it allows only certain substances to pass through.',
      'The cell membrane is composed of a lipid bilayer with embedded proteins. It plays a crucial role in protecting the cell and regulating the transport of materials.',
    ]},
    { heading: '1.3 Cell Organelles', paragraphs: [
      'The **nucleus** is the control centre of the cell. It contains the genetic material (DNA) organized into structures called chromosomes.',
      'The **mitochondria** are known as the "powerhouse of the cell" because they generate most of the cell\'s supply of adenosine triphosphate (ATP), used as a source of chemical energy.',
    ], formula: 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy' },
  ]},
  english: { sections: [
    { heading: '1.1 About the Author', paragraphs: [
      'Isaac Asimov (1920–1992) was an American writer and professor of biochemistry at Boston University. He was known for his works of science fiction and popular science.',
      'Asimov was a prolific writer who wrote or edited more than 500 books. "The Fun They Had" was written in 1951 and is set in the year 2157.',
    ]},
    { heading: '1.2 Summary', paragraphs: [
      'The story is set in the future when children are taught by mechanical teachers at home. Margie and Tommy discover a real printed book about schools from centuries ago.',
      'Margie is fascinated by the idea of children going to a special building called a "school" where all the kids from the neighbourhood came, laughed and shouted in the schoolyard, and sat together in the classroom.',
    ]},
    { heading: '1.3 Key Themes', paragraphs: [
      'The story explores the contrast between **technology-driven individual learning** and **traditional community-based education**. It raises important questions about what makes learning truly meaningful.',
      'Asimov suggests that human interaction and shared experiences are essential components of education that cannot be replaced by even the most advanced technology.',
    ]},
  ]},
  maths: { sections: [
    { heading: '1.1 Introduction to Number Systems', paragraphs: [
      'We have studied different types of numbers in earlier classes. Let us recall them and explore a new set of numbers called **irrational numbers**.',
      'Natural numbers (N) = {1, 2, 3, 4, ...}. When we include zero, we get Whole numbers (W) = {0, 1, 2, 3, ...}.',
    ]},
    { heading: '1.2 Irrational Numbers', paragraphs: [
      'A number that cannot be expressed in the form p/q where p and q are integers and q ≠ 0 is called an **irrational number**.',
      'Examples include √2, √3, π (pi), and the number e. These numbers have non-terminating, non-repeating decimal expansions.',
    ], formula: '√2 = 1.41421356...' },
    { heading: '1.3 Real Numbers', paragraphs: [
      'The collection of all rational and irrational numbers is called **real numbers**. Every real number can be represented on the number line.',
    ]},
  ]},
}
