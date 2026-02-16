import { useAuth } from '@/components/AuthContext';
import { useCurrentUser } from '@/hooks/useSupabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugUser() {
  const { user, userRole, loading } = useAuth();
  const { data: dbUser, isLoading: dbLoading, error } = useCurrentUser();

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>🐛 User Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-bold">Auth User (from Supabase Auth):</h3>
            <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">
              {loading ? 'Loading...' : JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="font-bold">Database User (from users table):</h3>
            <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">
              {dbLoading ? 'Loading...' : JSON.stringify(dbUser, null, 2)}
            </pre>
            {error && (
              <div className="text-red-600 mt-2">
                Error: {error.message}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold">Detected Role:</h3>
            <p className="text-xl mt-2">
              {userRole ? (
                <span className="font-bold text-green-600">{userRole}</span>
              ) : (
                <span className="text-red-600">No role found!</span>
              )}
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <h3 className="font-bold text-yellow-800">✅ Checklist:</h3>
            <ul className="mt-2 space-y-1">
              <li>✓ Auth User ID: {user?.id || 'Not logged in'}</li>
              <li className={dbUser ? 'text-green-600' : 'text-red-600'}>
                {dbUser ? '✓' : '✗'} Database user record exists
              </li>
              <li className={dbUser?.role ? 'text-green-600' : 'text-red-600'}>
                {dbUser?.role ? '✓' : '✗'} Role is set ({dbUser?.role || 'missing'})
              </li>
              <li className={dbUser?.email === user?.email ? 'text-green-600' : 'text-red-600'}>
                {dbUser?.email === user?.email ? '✓' : '✗'} Email matches
              </li>
            </ul>
          </div>

          {!dbUser && user && (
            <div className="bg-red-50 border border-red-200 p-4 rounded">
              <h3 className="font-bold text-red-800">❌ Problem Found!</h3>
              <p className="mt-2">
                You're logged into Supabase Auth, but there's no matching record in the <code>users</code> table.
              </p>
              <p className="mt-2 font-bold">Solution:</p>
              <ol className="list-decimal ml-6 mt-2">
                <li>Go to Supabase Dashboard → Table Editor → users</li>
                <li>Click "Insert" → "Insert row"</li>
                <li>
                  Fill in:
                  <pre className="bg-white p-2 mt-1 text-sm">
                    id: {user.id}
                    {'\n'}name: Your Name
                    {'\n'}email: {user.email}
                    {'\n'}role: admin
                    {'\n'}department_id: 11111111-1111-1111-1111-111111111111
                  </pre>
                </li>
                <li>Save, then refresh this page</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
