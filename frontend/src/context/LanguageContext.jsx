import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.shop': 'Shop',
    'nav.cart': 'Cart',
    'nav.admin': 'Admin',
    
    // Home
    'home.hero.title': 'Sustainable Fashion for Everyone',
    'home.hero.subtitle': 'Premium quality, eco-friendly apparel',
    'home.tagline': 'Human Nature Athletica',
    'home.subtitle': 'Where Performance Meets Purpose. Sustainable athletic wear designed for those who push boundaries.',
    'home.shopCollection': 'Shop Collection',
    'home.ourStory': 'Our Story',
    'home.sustainable': 'Sustainable',
    'home.free': 'Free',
    'home.shipping': 'Shipping',
    'home.day': 'Day',
    'home.returns': 'Returns',
    'home.featuredCollection': 'Featured Collection',
    'home.featuredSubtitle': 'Handpicked pieces that define the intersection of style, performance, and sustainability',
    'home.loadingProducts': 'Loading amazing products...',
    'home.exploreCollection': 'Explore Full Collection',
    'home.comingSoon': 'New products coming soon...',
    'home.whyChooseHNA': 'Why Choose HNA?',
    'home.ecoTitle': 'Eco-Conscious',
    'home.ecoDesc': 'Every piece is crafted with sustainable materials and ethical practices. Fashion that cares for our planet.',
    'home.performanceTitle': 'Peak Performance',
    'home.performanceDesc': 'Engineered for athletes who demand the best. Breathable, flexible, and built to last through any challenge.',
    'home.styleTitle': 'Timeless Style',
    'home.styleDesc': 'Minimalist design meets maximum impact. Look good, feel great, and make a statement wherever you go.',
    'home.journeyStarts': 'Your Journey Starts Here',
    'home.joinMovement': 'Join the movement of conscious athletes, farmers, artists, and creators who refuse to compromise on style or sustainability.',
    'home.startShopping': 'Start Shopping Now',
    'home.cta.shop': 'Shop Now',
    'home.cta.learn': 'Learn More',
    
    // Products
    'product.addToCart': 'Add to Cart',
    'product.outOfStock': 'Out of Stock',
    'product.price': 'Price',
    'product.description': 'Description',
    'products.addToCart': 'Add to Cart',
    'products.added': '✓ Added!',
    'products.details': 'Product Details',
    'products.save': 'Save',
    'products.description': 'Description',
    'products.inStock': 'in stock',
    'products.outOfStock': 'Out of Stock',
    'products.tags': 'Tags',
    'products.welcomeTitle': 'Welcome to HNA Human Nature Athletica',
    'products.loading': 'Loading products...',
    'products.noProducts': 'No products available at the moment.',
    'products.shopCollection': 'Shop Our Collection',
    
    // Cart
    'cart.title': 'Your Cart',
    'cart.empty': 'Your cart is empty.',
    'cart.total': 'Total',
    'cart.subtotal': 'Subtotal',
    'cart.checkout': 'Proceed to Checkout',
    'cart.processing': 'Processing...',
    'cart.continueShopping': 'Continue Shopping',
    'cart.remove': 'Remove',
    'cart.affiliateCode': 'Affiliate Code',
    'cart.affiliatePrompt': 'Have an affiliate code?',
    'cart.affiliatePlaceholder': 'Enter code (e.g., SARAH10)',
    'cart.affiliateCodePlaceholder': 'Enter affiliate code',
    'cart.codeApplied': 'Code applied',
    'cart.affiliateCodeApplied': 'Code applied',
    
    // Checkout
    'checkout.success': 'Payment Successful!',
    'checkout.thankYou': 'Thank you for choosing',
    'checkout.orderNumber': 'Order',
    'checkout.whatNext': 'What happens next?',
    'checkout.confirmEmail': 'Confirmation email sent to',
    'checkout.processing': 'Your items are being prepared',
    'checkout.shipping': 'Shipping within',
    'checkout.businessDays': 'business days',
    'checkout.tracking': 'Tracking information will be sent via email',
    'checkout.support': 'Customer support available 24/7',
    'checkout.guarantee': '30-day money-back guarantee',
    'checkout.continueShopping': 'Continue Shopping',
    'checkout.backHome': 'Back to Home',
    'checkout.orderSummary': 'Order Summary',
    'checkout.totalPaid': 'Total Paid',
    'checkout.quantity': 'Quantity',
    
    // Admin
    'admin.dashboard': 'Dashboard',
    'admin.orders': 'Orders',
    'admin.products': 'Products',
    'admin.affiliates': 'Affiliates',
    'admin.salesReport': 'Sales Report',
    
    // Accessibility
    'a11y.skipToContent': 'Skip to main content',
    'a11y.fontSize': 'Font Size',
    'a11y.contrast': 'High Contrast',
    'a11y.reducedMotion': 'Reduce Motion',
    'a11y.screenReader': 'Screen Reader Mode',
    'a11y.language': 'Language',
    'a11y.close': 'Close',
    'a11y.menu': 'Menu',
    'a11y.settings': 'Accessibility Settings',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
  },
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.about': 'Acerca de',
    'nav.shop': 'Tienda',
    'nav.cart': 'Carrito',
    'nav.admin': 'Admin',
    
    // Home
    'home.hero.title': 'Moda Sostenible para Todos',
    'home.hero.subtitle': 'Ropa ecológica de primera calidad',
    'home.tagline': 'Human Nature Athletica',
    'home.subtitle': 'Donde el Rendimiento se Encuentra con el Propósito. Ropa deportiva sostenible diseñada para quienes rompen límites.',
    'home.shopCollection': 'Ver Colección',
    'home.ourStory': 'Nuestra Historia',
    'home.sustainable': 'Sostenible',
    'home.free': 'Envío',
    'home.shipping': 'Gratis',
    'home.day': 'Días',
    'home.returns': 'Devoluciones',
    'home.featuredCollection': 'Colección Destacada',
    'home.featuredSubtitle': 'Piezas seleccionadas que definen la intersección entre estilo, rendimiento y sostenibilidad',
    'home.loadingProducts': 'Cargando productos increíbles...',
    'home.exploreCollection': 'Explorar Colección Completa',
    'home.comingSoon': 'Nuevos productos próximamente...',
    'home.whyChooseHNA': '¿Por qué elegir HNA?',
    'home.ecoTitle': 'Eco-Consciente',
    'home.ecoDesc': 'Cada pieza está elaborada con materiales sostenibles y prácticas éticas. Moda que cuida nuestro planeta.',
    'home.performanceTitle': 'Máximo Rendimiento',
    'home.performanceDesc': 'Diseñado para atletas que exigen lo mejor. Transpirable, flexible y construido para durar cualquier desafío.',
    'home.styleTitle': 'Estilo Atemporal',
    'home.styleDesc': 'Diseño minimalista con máximo impacto. Luce bien, siéntete genial y haz una declaración dondequiera que vayas.',
    'home.journeyStarts': 'Tu Viaje Comienza Aquí',
    'home.joinMovement': 'Únete al movimiento de atletas, agricultores, artistas y creadores conscientes que se niegan a comprometer el estilo o la sostenibilidad.',
    'home.startShopping': 'Comenzar a Comprar Ahora',
    'home.cta.shop': 'Comprar Ahora',
    'home.cta.learn': 'Saber Más',
    
    // Products
    'product.addToCart': 'Añadir al Carrito',
    'product.outOfStock': 'Agotado',
    'product.price': 'Precio',
    'product.description': 'Descripción',
    'products.addToCart': 'Añadir al Carrito',
    'products.added': '✓ ¡Añadido!',
    'products.details': 'Detalles del Producto',
    'products.save': 'Ahorrar',
    'products.description': 'Descripción',
    'products.inStock': 'en stock',
    'products.outOfStock': 'Agotado',
    'products.tags': 'Etiquetas',
    'products.welcomeTitle': 'Bienvenido a HNA Human Nature Athletica',
    'products.loading': 'Cargando productos...',
    'products.noProducts': 'No hay productos disponibles en este momento.',
    'products.shopCollection': 'Comprar Nuestra Colección',
    
    // Cart
    'cart.title': 'Tu Carrito',
    'cart.empty': 'Tu carrito está vacío.',
    'cart.total': 'Total',
    'cart.subtotal': 'Subtotal',
    'cart.checkout': 'Proceder al Pago',
    'cart.processing': 'Procesando...',
    'cart.continueShopping': 'Seguir Comprando',
    'cart.remove': 'Eliminar',
    'cart.affiliateCode': 'Código de Afiliado',
    'cart.affiliatePrompt': '¿Tienes un código de afiliado?',
    'cart.affiliatePlaceholder': 'Ingresa código (ej. SARAH10)',
    'cart.affiliateCodePlaceholder': 'Ingresa código de afiliado',
    'cart.codeApplied': 'Código aplicado',
    'cart.affiliateCodeApplied': 'Código aplicado',
    
    // Checkout
    'checkout.success': '¡Pago Exitoso!',
    'checkout.thankYou': 'Gracias por elegir',
    'checkout.orderNumber': 'Pedido',
    'checkout.whatNext': '¿Qué sigue?',
    'checkout.confirmEmail': 'Correo de confirmación enviado a',
    'checkout.processing': 'Tus artículos están siendo preparados',
    'checkout.shipping': 'Envío en',
    'checkout.businessDays': 'días hábiles',
    'checkout.tracking': 'La información de seguimiento se enviará por correo',
    'checkout.support': 'Soporte disponible 24/7',
    'checkout.guarantee': 'Garantía de devolución de 30 días',
    'checkout.continueShopping': 'Seguir Comprando',
    'checkout.backHome': 'Volver al Inicio',
    'checkout.orderSummary': 'Resumen del Pedido',
    'checkout.totalPaid': 'Total Pagado',
    'checkout.quantity': 'Cantidad',
    
    // Admin
    'admin.dashboard': 'Panel',
    'admin.orders': 'Pedidos',
    'admin.products': 'Productos',
    'admin.affiliates': 'Afiliados',
    'admin.salesReport': 'Informe de Ventas',
    
    // Accessibility
    'a11y.skipToContent': 'Saltar al contenido',
    'a11y.fontSize': 'Tamaño de Fuente',
    'a11y.contrast': 'Alto Contraste',
    'a11y.reducedMotion': 'Reducir Movimiento',
    'a11y.screenReader': 'Modo Lector de Pantalla',
    'a11y.language': 'Idioma',
    'a11y.close': 'Cerrar',
    'a11y.menu': 'Menú',
    'a11y.settings': 'Configuración de Accesibilidad',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.sort': 'Ordenar',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.shop': 'Boutique',
    'nav.cart': 'Panier',
    'nav.admin': 'Admin',
    
    // Home
    'home.hero.title': 'Mode Durable pour Tous',
    'home.hero.subtitle': 'Vêtements écologiques de qualité supérieure',
    'home.cta.shop': 'Acheter Maintenant',
    'home.cta.learn': 'En Savoir Plus',
    
    // Products
    'product.addToCart': 'Ajouter au Panier',
    'product.outOfStock': 'Rupture de Stock',
    'product.price': 'Prix',
    'product.description': 'Description',
    
    // Cart
    'cart.title': 'Panier d\'Achat',
    'cart.empty': 'Votre panier est vide',
    'cart.total': 'Total',
    'cart.checkout': 'Payer',
    'cart.continueShopping': 'Continuer les Achats',
    'cart.remove': 'Retirer',
    'cart.affiliateCode': 'Code d\'Affiliation',
    'cart.affiliateCodePlaceholder': 'Entrez le code d\'affiliation',
    'cart.affiliateCodeApplied': 'Code appliqué',
    
    // Checkout
    'checkout.success': 'Paiement Réussi!',
    'checkout.thankYou': 'Merci d\'avoir choisi',
    'checkout.orderNumber': 'Commande',
    'checkout.whatNext': 'Que se passe-t-il ensuite?',
    'checkout.confirmEmail': 'Email de confirmation envoyé à',
    'checkout.processing': 'Vos articles sont en préparation',
    'checkout.shipping': 'Expédition sous',
    'checkout.businessDays': 'jours ouvrables',
    'checkout.tracking': 'Les informations de suivi seront envoyées par email',
    'checkout.support': 'Support client disponible 24/7',
    'checkout.guarantee': 'Garantie satisfait ou remboursé 30 jours',
    'checkout.continueShopping': 'Continuer les Achats',
    'checkout.backHome': 'Retour à l\'Accueil',
    'checkout.orderSummary': 'Résumé de la Commande',
    'checkout.totalPaid': 'Total Payé',
    'checkout.quantity': 'Quantité',
    
    // Admin
    'admin.dashboard': 'Tableau de Bord',
    'admin.orders': 'Commandes',
    'admin.products': 'Produits',
    'admin.affiliates': 'Affiliés',
    'admin.salesReport': 'Rapport de Ventes',
    
    // Accessibility
    'a11y.skipToContent': 'Aller au contenu',
    'a11y.fontSize': 'Taille de Police',
    'a11y.contrast': 'Contraste Élevé',
    'a11y.reducedMotion': 'Réduire le Mouvement',
    'a11y.screenReader': 'Mode Lecteur d\'Écran',
    'a11y.language': 'Langue',
    'a11y.close': 'Fermer',
    'a11y.menu': 'Menu',
    'a11y.settings': 'Paramètres d\'Accessibilité',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.sort': 'Trier',
  },
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.about': '关于',
    'nav.shop': '商店',
    'nav.cart': '购物车',
    'nav.admin': '管理',
    
    // Home
    'home.hero.title': '人人可持续时尚',
    'home.hero.subtitle': '优质环保服装',
    'home.cta.shop': '立即购买',
    'home.cta.learn': '了解更多',
    
    // Products
    'product.addToCart': '加入购物车',
    'product.outOfStock': '缺货',
    'product.price': '价格',
    'product.description': '描述',
    
    // Cart
    'cart.title': '购物车',
    'cart.empty': '您的购物车是空的',
    'cart.total': '总计',
    'cart.checkout': '结账',
    'cart.continueShopping': '继续购物',
    'cart.remove': '删除',
    'cart.affiliateCode': '推广代码',
    'cart.affiliateCodePlaceholder': '输入推广代码',
    'cart.affiliateCodeApplied': '代码已应用',
    
    // Checkout
    'checkout.success': '支付成功！',
    'checkout.thankYou': '感谢您选择',
    'checkout.orderNumber': '订单',
    'checkout.whatNext': '接下来会怎样？',
    'checkout.confirmEmail': '确认邮件已发送至',
    'checkout.processing': '您的商品正在准备中',
    'checkout.shipping': '发货时间',
    'checkout.businessDays': '个工作日',
    'checkout.tracking': '跟踪信息将通过电子邮件发送',
    'checkout.support': '24/7客户支持',
    'checkout.guarantee': '30天退款保证',
    'checkout.continueShopping': '继续购物',
    'checkout.backHome': '返回首页',
    'checkout.orderSummary': '订单摘要',
    'checkout.totalPaid': '已支付总额',
    'checkout.quantity': '数量',
    
    // Admin
    'admin.dashboard': '仪表板',
    'admin.orders': '订单',
    'admin.products': '产品',
    'admin.affiliates': '推广',
    'admin.salesReport': '销售报告',
    
    // Accessibility
    'a11y.skipToContent': '跳至主要内容',
    'a11y.fontSize': '字体大小',
    'a11y.contrast': '高对比度',
    'a11y.reducedMotion': '减少动画',
    'a11y.screenReader': '屏幕阅读器模式',
    'a11y.language': '语言',
    'a11y.close': '关闭',
    'a11y.menu': '菜单',
    'a11y.settings': '辅助功能设置',
    
    // Common
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.sort': '排序',
  },
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.about': 'حول',
    'nav.shop': 'متجر',
    'nav.cart': 'سلة',
    'nav.admin': 'إدارة',
    
    // Home
    'home.hero.title': 'أزياء مستدامة للجميع',
    'home.hero.subtitle': 'ملابس صديقة للبيئة بجودة عالية',
    'home.cta.shop': 'تسوق الآن',
    'home.cta.learn': 'اعرف المزيد',
    
    // Products
    'product.addToCart': 'أضف إلى السلة',
    'product.outOfStock': 'نفذ من المخزون',
    'product.price': 'السعر',
    'product.description': 'الوصف',
    
    // Cart
    'cart.title': 'سلة التسوق',
    'cart.empty': 'سلتك فارغة',
    'cart.total': 'المجموع',
    'cart.checkout': 'الدفع',
    'cart.continueShopping': 'متابعة التسوق',
    'cart.remove': 'إزالة',
    'cart.affiliateCode': 'كود الشراكة',
    'cart.affiliateCodePlaceholder': 'أدخل كود الشراكة',
    'cart.affiliateCodeApplied': 'تم تطبيق الكود',
    
    // Checkout
    'checkout.success': 'تم الدفع بنجاح!',
    'checkout.thankYou': 'شكراً لاختيارك',
    'checkout.orderNumber': 'طلب',
    'checkout.whatNext': 'ماذا بعد؟',
    'checkout.confirmEmail': 'تم إرسال بريد التأكيد إلى',
    'checkout.processing': 'يتم تحضير طلبك',
    'checkout.shipping': 'الشحن خلال',
    'checkout.businessDays': 'أيام عمل',
    'checkout.tracking': 'سيتم إرسال معلومات التتبع عبر البريد',
    'checkout.support': 'دعم العملاء متاح 24/7',
    'checkout.guarantee': 'ضمان استرداد 30 يوم',
    'checkout.continueShopping': 'متابعة التسوق',
    'checkout.backHome': 'العودة للرئيسية',
    'checkout.orderSummary': 'ملخص الطلب',
    'checkout.totalPaid': 'المبلغ المدفوع',
    'checkout.quantity': 'الكمية',
    
    // Admin
    'admin.dashboard': 'لوحة التحكم',
    'admin.orders': 'الطلبات',
    'admin.products': 'المنتجات',
    'admin.affiliates': 'الشركاء',
    'admin.salesReport': 'تقرير المبيعات',
    
    // Accessibility
    'a11y.skipToContent': 'الانتقال إلى المحتوى',
    'a11y.fontSize': 'حجم الخط',
    'a11y.contrast': 'تباين عالي',
    'a11y.reducedMotion': 'تقليل الحركة',
    'a11y.screenReader': 'وضع قارئ الشاشة',
    'a11y.language': 'اللغة',
    'a11y.close': 'إغلاق',
    'a11y.menu': 'القائمة',
    'a11y.settings': 'إعدادات إمكانية الوصول',
    
    // Common
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.sort': 'ترتيب',
  }
};

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', currentLang);
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  }, [currentLang]);

  const t = (key) => {
    return translations[currentLang]?.[key] || translations.en[key] || key;
  };

  const changeLanguage = (langCode) => {
    setCurrentLang(langCode);
  };

  return (
    <LanguageContext.Provider value={{ currentLang, changeLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};
