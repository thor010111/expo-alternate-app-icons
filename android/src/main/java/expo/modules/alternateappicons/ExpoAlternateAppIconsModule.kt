package expo.modules.alternateappicons

import android.content.ComponentName
import android.content.Context
import android.content.Context.MODE_PRIVATE
import android.content.SharedPreferences
import android.content.pm.PackageManager
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition


class ExpoAlternateAppIconsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoAlternateAppIcons")

    AsyncFunction("setAlternateAppIcon") { alternateIconName: String?, promise: Promise ->
        try {
          val context = requireNotNull(appContext.reactContext)
          val currentIconName = getCurrentAlternateAppIconName(context)

          if(alternateIconName != currentIconName) {
            enableAlternateAppIcon(context, alternateIconName)
            disableAlternateAppIcon(context, currentIconName)

            appContext.activityProvider?.currentActivity?.finish()
          }
        } catch (error: Throwable) {
          promise.reject(CodedException(error))
        }
    }

    AsyncFunction("getCurrentAlternateAppIconName") { promise: Promise ->
      try {
        val context = requireNotNull(appContext.reactContext)
        promise.resolve(getCurrentAlternateAppIconName(context))
      } catch (error: Throwable) {
        promise.reject(CodedException(error))
      }
    }
  }

  private fun enableAlternateAppIcon(context: Context, alternateAppIconName: String?) {
    val componentName = getComponentFromIconName(context, alternateAppIconName)
    context.packageManager.setComponentEnabledSetting(componentName, PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP)
    setCurrentAlternateAppIconName(context, alternateAppIconName)
  }

  private fun disableAlternateAppIcon(context: Context, alternateAppIconName: String?) {
    val componentName = getComponentFromIconName(context, alternateAppIconName)
    context.packageManager.setComponentEnabledSetting(componentName, PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP)

    val currentIconName = getCurrentAlternateAppIconName(context)
    if(currentIconName == alternateAppIconName) {
      setCurrentAlternateAppIconName(context, null)
    }
  }

  private fun setCurrentAlternateAppIconName(context: Context, iconName: String?) {
    val editor = getPreferences(context).edit()

    if(iconName != null) {
      editor.putString("currentIcon", iconName).apply()
    } else {
      editor.remove("currentIcon").apply()
    }
  }

  private fun getCurrentAlternateAppIconName(context: Context): String? {
   return getPreferences(context).getString("currentIcon", null)
  }

  private fun getPreferences(context: Context): SharedPreferences {
    return context.getSharedPreferences("expo.alternate-app-icons", MODE_PRIVATE)
  }

  private fun getComponentFromIconName(context: Context, iconName: String?): ComponentName {
    var activityName = context.packageName + ".MainActivity"
    if(iconName != null) {
      activityName += "_$iconName"
    } else {
      activityName += "_ic_launcher"
    }

    return ComponentName(context.packageName, activityName)
  }
}
