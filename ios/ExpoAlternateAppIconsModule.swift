import ExpoModulesCore

public class ExpoAlternateAppIconsModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ExpoAlternateAppIcons")
        
        AsyncFunction("setAlternateAppIcon") { (alternateIconName: String?, promise: Promise) in
            UIApplication.shared.setAlternateIconName(alternateIconName) { error in
                
                if let error {
                    promise.reject(error)
                } else {
                    promise.resolve()
                }
            }
        }
        
        AsyncFunction("getCurrentAlternateAppIconName") { (promise: Promise) in
            promise.resolve(UIApplication.shared.alternateIconName)
        }
    }
}
