package expo.modules.alternateappicons

import android.R
import android.app.AlertDialog
import android.content.ComponentName
import android.content.Context
import android.content.Context.MODE_PRIVATE
import android.content.DialogInterface
import android.content.SharedPreferences
import android.content.pm.PackageManager
import androidx.core.content.res.ResourcesCompat
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

          val drawableId = context.resources
              .getIdentifier(alternateIconName ?: "ic_launcher", "mipmap", context.packageName)

          val drawable = ResourcesCompat.getDrawable(context.resources, drawableId, null)

          appContext.activityProvider?.currentActivity?.runOnUiThread {
            AlertDialog.Builder(appContext.activityProvider?.currentActivity)
              .setTitle("Icon will change")
              .setMessage("Are you sure you want to delete this entry?") // Specifying a listener allows you to take an action before dismissing the dialog.
              .setIcon(drawable)
              .setNeutralButton("OK", DialogInterface.OnClickListener { _, _ ->
                try {
                  enableAlternateAppIcon(context, alternateIconName ?: "ic_launcher")
                  disableAlternateAppIcon(context, currentIconName)

                  promise.resolve(null)
                } catch (error: Throwable) {
                  promise.reject(CodedException(error))
                }
              })
              .show()
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

  private fun enableAlternateAppIcon(context: Context, alternateAppIconName: String) {
    val componentName = getComponentFromIconName(context, alternateAppIconName)
    context.packageManager.setComponentEnabledSetting(componentName, PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP)
    setCurrentAlternateAppIconName(context, alternateAppIconName)
  }

  private fun disableAlternateAppIcon(context: Context, alternateAppIconName: String) {
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
      editor.remove("currentIcon")
    }
  }

  private fun getCurrentAlternateAppIconName(context: Context): String {
   return getPreferences(context).getString("currentIcon", null) ?: "ic_launcher"
  }

  private fun getPreferences(context: Context): SharedPreferences {
    return context.getSharedPreferences("expo.alternate-app-icons", MODE_PRIVATE)
  }

  private fun getComponentFromIconName(context: Context, iconName: String): ComponentName {
    val activityName: String = context.packageName + ".MainActivity_" + iconName
    return ComponentName(context.packageName, activityName)
  }
}
