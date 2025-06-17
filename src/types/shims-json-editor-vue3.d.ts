declare module 'json-editor-vue3' {
  import { DefineComponent } from 'vue'
  
  const JsonEditor: DefineComponent<{
    modelValue: any;
    options?: Record<string, any>;
    mode?: string;
    readOnly?: boolean;
    navigationBar?: boolean;
    statusBar?: boolean;
    mainMenuBar?: boolean;
  }>
  
  export { JsonEditor }
  export default JsonEditor
}