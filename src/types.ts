export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: any;
}

export interface Transformation {
  id?: string;
  userId: string;
  type: 'image' | 'video';
  originalUrl: string;
  transformedUrl: string;
  style: string;
  styleDescription?: string;
  config: any;
  timestamp: any;
}

export type ToonStyle = {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  prompt: string;
};

export const TOON_STYLES: ToonStyle[] = [
  {
    id: 'classic-toon',
    name: 'Classic Impression',
    description: 'A refined, balanced aesthetic with fluid transitions and sophisticated outlines.',
    previewUrl: 'https://picsum.photos/seed/toon/400/400',
    prompt: 'Transform this image into a refined classic cartoon style with fluid transitions.'
  },
  {
    id: 'bold-comic',
    name: 'Graphic Noir',
    description: 'Dramatic high-contrast composition with commanding ink work and vibrant palettes.',
    previewUrl: 'https://picsum.photos/seed/comic/400/400',
    prompt: 'Transform this image into a dramatic high-contrast graphic noir style.'
  },
  {
    id: 'pencil-sketch',
    name: 'Graphite Study',
    description: 'An intricate monochromatic exploration with delicate textures and precise edge definition.',
    previewUrl: 'https://picsum.photos/seed/sketch/400/400',
    prompt: 'Transform this image into an intricate graphite pencil study.'
  },
  {
    id: 'soft-pastel',
    name: 'Ethereal Pastel',
    description: 'A dreamlike, borderless manifestation of soft light and muted chromatic harmonies.',
    previewUrl: 'https://picsum.photos/seed/pastel/400/400',
    prompt: 'Transform this image into a dreamlike ethereal pastel style.'
  },
  {
    id: 'neon-pop',
    name: 'Luminescent Pop',
    description: 'An electric, high-saturation odyssey with radiant edges and avant-garde energy.',
    previewUrl: 'https://picsum.photos/seed/neon/400/400',
    prompt: 'Transform this image into a luminescent neon pop style.'
  },
  {
    id: 'retro-8bit',
    name: 'Digital Mosaic',
    description: 'A nostalgic pixelated synthesis, celebrating the geometric beauty of early digital eras.',
    previewUrl: 'https://picsum.photos/seed/pixel/400/400',
    prompt: 'Transform this image into a sophisticated digital mosaic pixel art style.'
  },
  {
    id: 'ink-wash',
    name: 'Sumi-e Ink',
    description: 'Traditional East Asian ink mastery, capturing the essence of motion with fluid brushwork.',
    previewUrl: 'https://picsum.photos/seed/ink/400/400',
    prompt: 'Transform this image into a traditional Sumi-e ink wash style.'
  },
  {
    id: 'pop-art',
    name: 'Chromatic Pop',
    description: 'A bold, iconic aesthetic inspired by the mid-century masters of visual culture.',
    previewUrl: 'https://picsum.photos/seed/popart/400/400',
    prompt: 'Transform this image into a bold chromatic pop art style.'
  },
  {
    id: 'vaporwave',
    name: 'Retro-Futurism',
    description: 'A surrealist 80s dreamscape of neon gradients, digital artifacts, and nostalgic longing.',
    previewUrl: 'https://picsum.photos/seed/vapor/400/400',
    prompt: 'Transform this image into a surrealist retro-futurism vaporwave style.'
  },
  {
    id: 'charcoal',
    name: 'Carbon Study',
    description: 'A raw, textured monochromatic rendering with profound shadows and expressive depth.',
    previewUrl: 'https://picsum.photos/seed/charcoal/400/400',
    prompt: 'Transform this image into a raw carbon charcoal study.'
  },
  {
    id: 'animegan',
    name: 'Cinematic Anime',
    description: 'High-fidelity neural transformation with breathtaking lighting and cinematic depth.',
    previewUrl: 'https://picsum.photos/seed/animegan/400/400',
    prompt: 'Transform this image using the AnimeGAN model style, focusing on breathtaking lighting and cinematic depth.'
  },
  {
    id: 'anime-style',
    name: 'Nippon Animation',
    description: 'The quintessential Japanese animation aesthetic, featuring vibrant palettes and sharp precision.',
    previewUrl: 'https://picsum.photos/seed/anime/400/400',
    prompt: 'Transform this image into a quintessential Nippon animation style.'
  },
  {
    id: '3d-render',
    name: 'Dimensional Synthesis',
    description: 'A smooth, high-fidelity 3D manifestation with realistic light and volume.',
    previewUrl: 'https://picsum.photos/seed/3d/400/400',
    prompt: 'Transform this image into a high-fidelity dimensional 3D synthesis.'
  },
  {
    id: 'cyberpunk',
    name: 'Neo-Tokyo',
    description: 'A futuristic urban odyssey defined by neon saturation and high-tech contrast.',
    previewUrl: 'https://picsum.photos/seed/cyber/400/400',
    prompt: 'Transform this image into a Neo-Tokyo cyberpunk aesthetic.'
  },
  {
    id: 'oil-painting',
    name: 'Renaissance Oil',
    description: 'A rich, textured masterpiece with commanding brushwork and historical depth.',
    previewUrl: 'https://picsum.photos/seed/oil/400/400',
    prompt: 'Transform this image into a rich Renaissance oil painting.'
  },
  {
    id: 'watercolor',
    name: 'Fluid Aquarelle',
    description: 'A delicate interplay of bleeding pigments and organic paper textures.',
    previewUrl: 'https://picsum.photos/seed/water/400/400',
    prompt: 'Transform this image into a delicate fluid aquarelle watercolor.'
  },
  {
    id: 'claymation',
    name: 'Organic Clay',
    description: 'A hand-sculpted tactile aesthetic with soft volumes and organic imperfections.',
    previewUrl: 'https://picsum.photos/seed/clay/400/400',
    prompt: 'Transform this image into a hand-sculpted organic clay style.'
  },
  {
    id: 'graffiti',
    name: 'Urban Mural',
    description: 'A raw street-art manifestation with expressive spray textures and bold energy.',
    previewUrl: 'https://picsum.photos/seed/graffiti/400/400',
    prompt: 'Transform this image into a raw urban mural graffiti style.'
  },
  {
    id: 'manga-style',
    name: 'Manga Monochrome',
    description: 'A dramatic Japanese graphic style with intricate screentone and ink depth.',
    previewUrl: 'https://picsum.photos/seed/manga/400/400',
    prompt: 'Transform this image into a dramatic manga monochrome style.'
  },
  {
    id: 'superhero-comic',
    name: 'Heroic Graphic',
    description: 'A dynamic mid-century comic aesthetic with iconic textures and heroic energy.',
    previewUrl: 'https://picsum.photos/seed/superhero/400/400',
    prompt: 'Transform this image into a dynamic heroic graphic style.'
  },
  {
    id: 'disney-classic',
    name: 'Golden Age Animation',
    description: 'A nostalgic, hand-drawn aesthetic inspired by the masters of early animation.',
    previewUrl: 'https://picsum.photos/seed/disney/400/400',
    prompt: 'Transform this image into a nostalgic golden age animation style.'
  },
  {
    id: 'pixel-cartoon',
    name: 'Pixelated Synthesis',
    description: 'A sophisticated fusion of classic animation and geometric digital art.',
    previewUrl: 'https://picsum.photos/seed/pixeltoon/400/400',
    prompt: 'Transform this image into a sophisticated pixelated synthesis style.'
  }
];
