<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\SuperAdmin;

class NotificationController extends Controller
{
    /**
     * List notifications for the authenticated Super Admin.
     */
    public function index(Request $request)
    {
        if (!($request->user() instanceof SuperAdmin)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $adminId = $request->user()->id;
        $items = Notification::where(function($q) use ($adminId) {
            $q->whereNull('recipient_admin_id')
              ->orWhere('recipient_admin_id', $adminId);
        })->latest()->limit(50)->get();

        return response()->json($items);
    }

    /**
     * Mark a single notification as read.
     */
    public function markRead(Request $request, $id)
    {
        if (!($request->user() instanceof SuperAdmin)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $adminId = $request->user()->id;
        $notif = Notification::where('id', $id)
            ->where(function($q) use ($adminId) {
                $q->whereNull('recipient_admin_id')
                  ->orWhere('recipient_admin_id', $adminId);
            })->firstOrFail();

        $notif->is_read = true;
        $notif->save();

        return response()->json(['message' => 'Marked read']);
    }

    /**
     * Mark all notifications as read for this admin.
     */
    public function markAllRead(Request $request)
    {
        if (!($request->user() instanceof SuperAdmin)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $adminId = $request->user()->id;
        Notification::where(function($q) use ($adminId) {
            $q->whereNull('recipient_admin_id')
              ->orWhere('recipient_admin_id', $adminId);
        })->update(['is_read' => true]);

        return response()->json(['message' => 'All marked read']);
    }

    /**
     * Delete a single notification (and emit an audit notification).
     */
    public function destroy(Request $request, $id)
    {
        if (!($request->user() instanceof SuperAdmin)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $adminId = $request->user()->id;
        $notif = Notification::where('id', $id)
            ->where(function($q) use ($adminId) {
                $q->whereNull('recipient_admin_id')
                  ->orWhere('recipient_admin_id', $adminId);
            })->firstOrFail();

        $title = $notif->title;
        $notif->delete();

        return response()->json(['message' => 'Deleted']);
    }

    /**
     * Delete all notifications for this admin (and emit an audit notification).
     */
    public function destroyAll(Request $request)
    {
        if (!($request->user() instanceof SuperAdmin)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $adminId = $request->user()->id;
        Notification::where(function($q) use ($adminId) {
            $q->whereNull('recipient_admin_id')
              ->orWhere('recipient_admin_id', $adminId);
        })->delete();

        return response()->json(['message' => 'All deleted']);
    }
}
