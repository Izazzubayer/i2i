'use client'

import { createContext, useContext, useState, useEffect } from 'react'

// Available languages
export const languages = {
  en: { code: 'en', name: 'English', flag: '🇺🇸' },
  es: { code: 'es', name: 'Español', flag: '🇪🇸' },
  fr: { code: 'fr', name: 'Français', flag: '🇫🇷' },
  de: { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  zh: { code: 'zh', name: '中文', flag: '🇨🇳' },
}

// Default language
const defaultLanguage = 'en'

// Translation keys
const translations = {
  en: {
    // Navigation
    home: 'Home',
    upload: 'Upload',
    orders: 'Orders',
    portfolio: 'Portfolio',
    pricing: 'Pricing',
    account: 'Account',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    signOut: 'Sign Out',
    
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    clear: 'Clear',
    apply: 'Apply',
    confirm: 'Confirm',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    
    // Orders
    myOrders: 'My Orders',
    newOrder: 'New Order',
    orderDetails: 'Order Details',
    orderNumber: 'Order Number',
    status: 'Status',
    createdAt: 'Created At',
    completedAt: 'Completed At',
    images: 'Images',
    totalImages: 'Total Images',
    
    // Upload
    uploadImages: 'Upload Images',
    dragAndDrop: 'Drag and drop images here',
    or: 'or',
    browse: 'Browse',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    
    // Account
    profile: 'Profile',
    security: 'Security',
    settings: 'Settings',
    changePassword: 'Change Password',
    
    // DAM Integrations
    damIntegrations: 'DAM Integrations',
    addIntegration: 'Add Integration',
    connect: 'Connect',
    disconnect: 'Disconnect',
    connected: 'Connected',
    availableIntegrations: 'Available DAM Integrations',
  },
  es: {
    // Navigation
    home: 'Inicio',
    upload: 'Subir',
    orders: 'Pedidos',
    portfolio: 'Portafolio',
    pricing: 'Precios',
    account: 'Cuenta',
    signIn: 'Iniciar Sesión',
    signUp: 'Registrarse',
    signOut: 'Cerrar Sesión',
    
    // Common
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    close: 'Cerrar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    search: 'Buscar',
    filter: 'Filtrar',
    clear: 'Limpiar',
    apply: 'Aplicar',
    confirm: 'Confirmar',
    success: 'Éxito',
    error: 'Error',
    warning: 'Advertencia',
    
    // Orders
    myOrders: 'Mis Pedidos',
    newOrder: 'Nuevo Pedido',
    orderDetails: 'Detalles del Pedido',
    orderNumber: 'Número de Pedido',
    status: 'Estado',
    createdAt: 'Creado En',
    completedAt: 'Completado En',
    images: 'Imágenes',
    totalImages: 'Total de Imágenes',
    
    // Upload
    uploadImages: 'Subir Imágenes',
    dragAndDrop: 'Arrastra y suelta imágenes aquí',
    or: 'o',
    browse: 'Explorar',
    processing: 'Procesando',
    completed: 'Completado',
    failed: 'Fallido',
    
    // Account
    profile: 'Perfil',
    security: 'Seguridad',
    settings: 'Configuración',
    changePassword: 'Cambiar Contraseña',
    
    // DAM Integrations
    damIntegrations: 'Integraciones DAM',
    addIntegration: 'Agregar Integración',
    connect: 'Conectar',
    disconnect: 'Desconectar',
    connected: 'Conectado',
    availableIntegrations: 'Integraciones DAM Disponibles',
  },
  fr: {
    // Navigation
    home: 'Accueil',
    upload: 'Télécharger',
    orders: 'Commandes',
    portfolio: 'Portefeuille',
    pricing: 'Tarifs',
    account: 'Compte',
    signIn: 'Se Connecter',
    signUp: "S'Inscrire",
    signOut: 'Se Déconnecter',
    
    // Common
    loading: 'Chargement...',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    close: 'Fermer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    search: 'Rechercher',
    filter: 'Filtrer',
    clear: 'Effacer',
    apply: 'Appliquer',
    confirm: 'Confirmer',
    success: 'Succès',
    error: 'Erreur',
    warning: 'Avertissement',
    
    // Orders
    myOrders: 'Mes Commandes',
    newOrder: 'Nouvelle Commande',
    orderDetails: 'Détails de la Commande',
    orderNumber: 'Numéro de Commande',
    status: 'Statut',
    createdAt: 'Créé Le',
    completedAt: 'Terminé Le',
    images: 'Images',
    totalImages: 'Total d\'Images',
    
    // Upload
    uploadImages: 'Télécharger des Images',
    dragAndDrop: 'Glissez-déposez des images ici',
    or: 'ou',
    browse: 'Parcourir',
    processing: 'Traitement',
    completed: 'Terminé',
    failed: 'Échoué',
    
    // Account
    profile: 'Profil',
    security: 'Sécurité',
    settings: 'Paramètres',
    changePassword: 'Changer le Mot de Passe',
    
    // DAM Integrations
    damIntegrations: 'Intégrations DAM',
    addIntegration: 'Ajouter une Intégration',
    connect: 'Connecter',
    disconnect: 'Déconnecter',
    connected: 'Connecté',
    availableIntegrations: 'Intégrations DAM Disponibles',
  },
  de: {
    // Navigation
    home: 'Startseite',
    upload: 'Hochladen',
    orders: 'Bestellungen',
    portfolio: 'Portfolio',
    pricing: 'Preise',
    account: 'Konto',
    signIn: 'Anmelden',
    signUp: 'Registrieren',
    signOut: 'Abmelden',
    
    // Common
    loading: 'Laden...',
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    close: 'Schließen',
    back: 'Zurück',
    next: 'Weiter',
    previous: 'Zurück',
    search: 'Suchen',
    filter: 'Filtern',
    clear: 'Löschen',
    apply: 'Anwenden',
    confirm: 'Bestätigen',
    success: 'Erfolg',
    error: 'Fehler',
    warning: 'Warnung',
    
    // Orders
    myOrders: 'Meine Bestellungen',
    newOrder: 'Neue Bestellung',
    orderDetails: 'Bestelldetails',
    orderNumber: 'Bestellnummer',
    status: 'Status',
    createdAt: 'Erstellt Am',
    completedAt: 'Abgeschlossen Am',
    images: 'Bilder',
    totalImages: 'Gesamtbilder',
    
    // Upload
    uploadImages: 'Bilder Hochladen',
    dragAndDrop: 'Bilder hier ablegen',
    or: 'oder',
    browse: 'Durchsuchen',
    processing: 'Verarbeitung',
    completed: 'Abgeschlossen',
    failed: 'Fehlgeschlagen',
    
    // Account
    profile: 'Profil',
    security: 'Sicherheit',
    settings: 'Einstellungen',
    changePassword: 'Passwort Ändern',
    
    // DAM Integrations
    damIntegrations: 'DAM-Integrationen',
    addIntegration: 'Integration Hinzufügen',
    connect: 'Verbinden',
    disconnect: 'Trennen',
    connected: 'Verbunden',
    availableIntegrations: 'Verfügbare DAM-Integrationen',
  },
  zh: {
    // Navigation
    home: '首页',
    upload: '上传',
    orders: '订单',
    portfolio: '作品集',
    pricing: '定价',
    account: '账户',
    signIn: '登录',
    signUp: '注册',
    signOut: '退出',
    
    // Common
    loading: '加载中...',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    close: '关闭',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    search: '搜索',
    filter: '筛选',
    clear: '清除',
    apply: '应用',
    confirm: '确认',
    success: '成功',
    error: '错误',
    warning: '警告',
    
    // Orders
    myOrders: '我的订单',
    newOrder: '新订单',
    orderDetails: '订单详情',
    orderNumber: '订单号',
    status: '状态',
    createdAt: '创建时间',
    completedAt: '完成时间',
    images: '图片',
    totalImages: '总图片数',
    
    // Upload
    uploadImages: '上传图片',
    dragAndDrop: '拖放图片到这里',
    or: '或',
    browse: '浏览',
    processing: '处理中',
    completed: '已完成',
    failed: '失败',
    
    // Account
    profile: '个人资料',
    security: '安全',
    settings: '设置',
    changePassword: '修改密码',
    
    // DAM Integrations
    damIntegrations: 'DAM集成',
    addIntegration: '添加集成',
    connect: '连接',
    disconnect: '断开',
    connected: '已连接',
    availableIntegrations: '可用的DAM集成',
  },
}

// Language Context
const LanguageContext = createContext({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key) => key,
})

// Language Provider Component
export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(defaultLanguage)
  const [mounted, setMounted] = useState(false)

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') || defaultLanguage
      setLanguageState(savedLanguage)
      setMounted(true)
    }
  }, [])

  // Set language and save to localStorage
  const setLanguage = (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
      setLanguageState(lang)
      // Dispatch custom event for components that need to react to language changes
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }))
    }
  }

  // Translation function
  const t = (key) => {
    return translations[language]?.[key] || translations[defaultLanguage]?.[key] || key
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  )
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Translation hook (shorthand)
export function useTranslation() {
  const { t } = useLanguage()
  return t
}

