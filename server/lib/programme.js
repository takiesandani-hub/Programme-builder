const TYPES = ['wedding', 'funeral', 'restaurant', 'meeting'];

const TYPE_PATH_PREFIX = { wedding: 'w', funeral: 'f', restaurant: 'm', meeting: 'c' };

const DEFAULT_TEMPLATE = { wedding: 'elegant', funeral: 'classic', restaurant: 'modern', meeting: 'editorial' };

const TEMPLATES = {
  wedding: ['elegant', 'modern', 'romantic'],
  funeral: ['classic', 'memorial'],
  restaurant: ['modern', 'elegant', 'simple'],
  meeting: ['editorial', 'modern'],
};

function defaultContent(type) {
  if (type === 'wedding') {
    return {
      brideName: '',
      groomName: '',
      date: '',
      time: '',
      venue: '',
      address: '',
      city: '',
      mapUrl: '',
      welcomeMessage: '',
      coverImage: '',
      schedule: [],
      party: [],
      story: '',
      gallery: [],
    };
  }
  if (type === 'funeral') {
    return {
      fullName: '',
      photo: '',
      dob: '',
      dop: '',
      age: '',
      location: '',
      memorialMessage: '',
      biography: '',
      orderOfService: [],
      tributes: [],
      gallery: [],
      funeralDate: '',
      funeralTime: '',
      venue: '',
      burialLocation: '',
      mapUrl: '',
      additionalInfo: '',
      coverImage: '',
    };
  }
  if (type === 'restaurant') {
    return {
      name: '',
      logo: '',
      description: '',
      categories: [],
      contact: '',
      location: '',
      mapUrl: '',
      hours: [],
      coverImage: '',
    };
  }
  if (type === 'meeting') {
    return {
      name: '',
      eventType: 'Conference',
      date: '',
      startTime: '',
      endTime: '',
      venue: '',
      address: '',
      city: '',
      mapUrl: '',
      description: '',
      coverImage: '',
      schedule: [],
    };
  }
  throw new Error(`Unknown programme type: ${type}`);
}

function slugSeed(type, content) {
  if (type === 'wedding') {
    const bride = content.brideName || '';
    const groom = content.groomName || '';
    return [bride, groom].filter(Boolean).join('-') || 'wedding';
  }
  if (type === 'funeral') {
    return content.fullName || 'memorial';
  }
  if (type === 'meeting') {
    return content.name || 'meeting';
  }
  return content.name || 'restaurant';
}

function displayTitle(programme) {
  const c = programme.content || {};
  if (programme.type === 'wedding') {
    const bride = c.brideName || '';
    const groom = c.groomName || '';
    if (bride || groom) return [bride, groom].filter(Boolean).join(' & ');
    return 'Untitled Wedding';
  }
  if (programme.type === 'funeral') {
    return c.fullName || 'Untitled Memorial';
  }
  if (programme.type === 'restaurant') {
    return c.name || 'Untitled Restaurant';
  }
  if (programme.type === 'meeting') {
    return c.name || 'Untitled Meeting';
  }
  return 'Untitled Programme';
}

function subtitle(type) {
  if (type === 'wedding') return 'Wedding Programme';
  if (type === 'funeral') return 'Memorial Programme';
  if (type === 'restaurant') return 'Restaurant Menu';
  if (type === 'meeting') return 'Meeting & Conference Programme';
  return '';
}

function publicPath(programme) {
  return `/${TYPE_PATH_PREFIX[programme.type]}/${programme.slug}`;
}

function summarize(programme) {
  return {
    id: programme.id,
    type: programme.type,
    slug: programme.slug,
    status: programme.status,
    template: programme.template,
    title: displayTitle(programme),
    subtitle: subtitle(programme.type),
    createdAt: programme.createdAt,
    updatedAt: programme.updatedAt,
    views: programme.views || 0,
    scans: programme.scans || 0,
    lastViewedAt: programme.lastViewedAt || null,
    publicPath: publicPath(programme),
  };
}

module.exports = {
  TYPES,
  TYPE_PATH_PREFIX,
  DEFAULT_TEMPLATE,
  TEMPLATES,
  defaultContent,
  slugSeed,
  displayTitle,
  subtitle,
  publicPath,
  summarize,
};
